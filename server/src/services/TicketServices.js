/**
* TicketService
* Manages the business logic for ticket generation and management.
*/
const {TicketNumberGenerator} = require('../utils/ticketNumberGenerator.js');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const DB_PATH = path.join(__dirname,'../../db/queue_management.db');

class TicketRepository{
    constructor(db){
        this.db = db;
    }
    
    async save(ticket) {
        const query = `INSERT INTO tickets (ticket_number, service_type_id, status, issued_at, queue_position) 
        VALUES (?, ?, ?, ?, ?)`;
        return new Promise((resolve, reject) =>{
            this.db.run(query,
                [ticket.ticket_number, ticket.service_type_id, ticket.status, ticket.issued_at, ticket.queue_position],
            function (err){
                if(err){
                    return reject(err);
                }
                resolve({ id: this.lastID, ...ticket });
            });
        });
    }

    async findById(ticketId) {
        return new Promise ((resolve, reject) => {
            this.db.get(`SELECT * FROM tickets WHERE id = ?`, [ticketId], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row || null);
            });
        });
    }

    async findByTicketNumber(ticketNumber) {
        return new Promise ((resolve, reject) => {
            this.db.get(`SELECT * FROM tickets WHERE ticket_number = ?`, [ticketNumber], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row || null);
            });
        });
    }

    async findByServiceType(serviceTypeId){
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM tickets WHERE service_type_id = ? AND status = 'WAITING' ORDER BY issued_at ASC`, [serviceTypeId], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows || []);
            });
        });
    }

    async findByStatus(status) {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM tickets WHERE status = ? ORDER BY issued_at ASC`, [status], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows || []);
            });
        });
    }

    async countWaitingTickets(serviceTypeId) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT COUNT(*) as count FROM tickets WHERE service_type_id = ? AND status = 'WAITING'`, [serviceTypeId], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row ? row.count : 0);
            });
        });
    }

    async getNextInQueue(serviceTypeId) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM tickets WHERE service_type_id = ? AND status = 'WAITING' ORDER BY issued_at ASC LIMIT 1`, [serviceTypeId], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row || null);
            });
        });
    }

    async updateTicketStatus(ticketId, status, additionalData = {}) {
        const updates = [`status = ?`];
        const params = [status, ticketId];
        
        // Add timestamp fields based on status
        if (status === 'SERVING' && !additionalData.called_at) {
            updates.push('called_at = CURRENT_TIMESTAMP');
        } else if (status === 'COMPLETED' && !additionalData.completed_at) {
            updates.push('completed_at = CURRENT_TIMESTAMP');
        } else if (status === 'CANCELLED' && !additionalData.cancelled_at) {
            updates.push('cancelled_at = CURRENT_TIMESTAMP');
        }
        
        // Add any additional data
        Object.keys(additionalData).forEach(key => {
            if (key !== 'id') {
                updates.push(`${key} = ?`);
                params.push(additionalData[key]);
            }
        });
        
        const query = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;
        
        return new Promise((resolve, reject) => {
            this.db.run(query, params, function(err) {
                if (err) {
                    return reject(err);
                }
                resolve({ changes: this.changes, lastID: this.lastID });
            });
        });
    }
}

class ServiceRepository{
    constructor(db){
        this.db = db;
    }
    
    async findById(id){
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM service_types WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row || null);
            });
        });
    }

    async findAllActive() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM service_types WHERE is_active = 1 ORDER BY name ASC`, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows || []);
            });
        });
    }

    async findActiveById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM service_types WHERE id = ? AND is_active = 1`, [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row || null);
            });
        });
    }
}

class CounterRepository {
    constructor(db) {
        this.db = db;
    }

    async findActiveByServiceType(serviceTypeId) {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM counters WHERE service_type_id = ? AND is_active = 1 ORDER BY counter_number ASC`, [serviceTypeId], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows || []);
            });
        });
    }

    async countActiveByServiceType(serviceTypeId) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT COUNT(*) as count FROM counters WHERE service_type_id = ? AND is_active = 1`, [serviceTypeId], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row ? row.count : 0);
            });
        });
    }
}

class TicketService {
    constructor() {
        this.db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error('Could not connect to database', err);
            } else {
                console.log('Connected to the SQLite database.');
            }   
        });
        this.ticketRepository = new TicketRepository(this.db);
        this.serviceRepository = new ServiceRepository(this.db);
        this.counterRepository = new CounterRepository(this.db);
        this.ticketNumberGenerator = new TicketNumberGenerator();  
    }

    /**
     * Issue a new ticket for a service type
     * @param {number} serviceTypeId - Service type ID
     * @returns {Promise<object>} Created ticket with full details
     */
    async issueTicket(serviceTypeId) {
        try {
            // Validate service type exists and is active
            const serviceType = await this.serviceRepository.findActiveById(serviceTypeId);
            if (!serviceType) {
                throw new Error('Service type not found or inactive');
            }

            // Generate unique ticket number
            await this.ticketNumberGenerator.connect();
            const ticketData = await this.ticketNumberGenerator.generateTicketNumber(serviceTypeId);
            const ticketNumber = ticketData.ticketNumber;

            // Calculate queue position
            const waitingTickets = await this.ticketRepository.findByServiceType(serviceTypeId);
            const positionInQueue = waitingTickets.length + 1;

            // Create ticket object
            const newTicket = {
                ticket_number: ticketNumber,
                service_type_id: serviceTypeId,
                status: 'WAITING',
                issued_at: new Date().toISOString(),
                queue_position: positionInQueue
            };

            // Save to database
            const savedTicket = await this.ticketRepository.save(newTicket);
            
            // Get active counters for this service type
            const activeCounters = await this.counterRepository.countActiveByServiceType(serviceTypeId);
            
            return {
                ticketId: savedTicket.id,
                ticketNumber: ticketNumber,
                serviceType: {
                    id: serviceType.id,
                    name: serviceType.name,
                    code: serviceType.code
                },
                status: 'WAITING',
                issuedAt: newTicket.issued_at,
                queuePosition: positionInQueue,
                estimatedWaitingTickets: positionInQueue - 1,
                activeCounters: activeCounters
            };
        } catch (error) {
            throw new Error(`Failed to issue ticket: ${error.message}`);
        }
    }

    /**
     * Get ticket information by ID
     * @param {number} ticketId - Ticket ID
     * @returns {Promise<object|null>} Ticket information
     */
    async getTicketInfo(ticketId) {
        try {
            const ticket = await this.ticketRepository.findById(ticketId);
            if (!ticket) {
                return null;
            }

            const serviceType = await this.serviceRepository.findById(ticket.service_type_id);
            return {
                ...ticket,
                serviceType: serviceType
            };
        } catch (error) {
            throw new Error(`Failed to get ticket info: ${error.message}`);
        }
    }

    /**
     * Get ticket information by ticket number
     * @param {string} ticketNumber - Ticket number (e.g., "A001")
     * @returns {Promise<object|null>} Ticket information
     */
    async getTicketByNumber(ticketNumber) {
        try {
            const ticket = await this.ticketRepository.findByTicketNumber(ticketNumber);
            if (!ticket) {
                return null;
            }

            const serviceType = await this.serviceRepository.findById(ticket.service_type_id);
            return {
                ...ticket,
                serviceType: serviceType
            };
        } catch (error) {
            throw new Error(`Failed to get ticket by number: ${error.message}`);
        }
    }

    /**
     * Get queue status for a service type
     * @param {number} serviceTypeId - Service type ID
     * @returns {Promise<object>} Queue status information
     */
    async getQueueStatus(serviceTypeId) {
        try {
            const serviceType = await this.serviceRepository.findActiveById(serviceTypeId);
            if (!serviceType) {
                throw new Error('Service type not found or inactive');
            }

            const waitingTickets = await this.ticketRepository.countWaitingTickets(serviceTypeId);
            const activeCounters = await this.counterRepository.countActiveByServiceType(serviceTypeId);
            const lastTicket = await this.ticketRepository.getNextInQueue(serviceTypeId);

            return {
                serviceTypeId: serviceTypeId,
                serviceTypeName: serviceType.name,
                waitingTickets: waitingTickets,
                activeCounters: activeCounters,
                lastTicketNumber: lastTicket ? lastTicket.ticket_number : null,
                estimatedWaitTime: this.calculateEstimatedWaitTime(waitingTickets, activeCounters, serviceType.average_service_time)
            };
        } catch (error) {
            throw new Error(`Failed to get queue status: ${error.message}`);
        }
    }

    /**
     * Cancel a ticket
     * @param {number} ticketId - Ticket ID
     * @returns {Promise<object>} Cancellation result
     */
    async cancelTicket(ticketId) {
        try {
            const ticket = await this.ticketRepository.findById(ticketId);
            if (!ticket) {
                throw new Error('Ticket not found');
            }

            if (ticket.status === 'COMPLETED') {
                throw new Error('Cannot cancel a completed ticket');
            }

            if (ticket.status === 'CANCELLED') {
                throw new Error('Ticket is already cancelled');
            }

            const result = await this.ticketRepository.updateTicketStatus(ticketId, 'CANCELLED');
            
            return {
                ticketId: ticketId,
                ticketNumber: ticket.ticket_number,
                status: 'CANCELLED',
                cancelledAt: new Date().toISOString(),
                message: 'Ticket cancelled successfully'
            };
        } catch (error) {
            throw new Error(`Failed to cancel ticket: ${error.message}`);
        }
    }

    /**
     * Get all active service types
     * @returns {Promise<Array>} List of active service types
     */
    async getActiveServiceTypes() {
        try {
            return await this.serviceRepository.findAllActive();
        } catch (error) {
            throw new Error(`Failed to get service types: ${error.message}`);
        }
    }

    /**
     * Calculate estimated wait time
     * @private
     * @param {number} waitingTickets - Number of waiting tickets
     * @param {number} activeCounters - Number of active counters
     * @param {number} averageServiceTime - Average service time in minutes
     * @returns {number} Estimated wait time in minutes
     */
    calculateEstimatedWaitTime(waitingTickets, activeCounters, averageServiceTime) {
        if (activeCounters === 0) {
            return null; // No counters available
        }
        
        const ticketsPerCounter = Math.ceil(waitingTickets / activeCounters);
        return ticketsPerCounter * averageServiceTime;
    }

    /**
     * Close database connection
     */
    async close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err);
                    } else {
                        console.log('Database connection closed.');
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = TicketService;