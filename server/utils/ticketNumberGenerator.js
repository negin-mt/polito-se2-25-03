/**
 * Ticket Number Generator
 * 
 * Generates unique ticket numbers for the Office Queue Management System.
 * Format: [Service Code][3-digit Sequence Number]
 * Example: A001, A042, B123
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const DB_PATH = path.join(__dirname, '../db/queue_management.db');

/**
 * Ticket Number Generator Class
 */
class TicketNumberGenerator {
    constructor(dbPath = DB_PATH) {
        this.dbPath = dbPath;
        this.db = null;
    }

    /**
     * Initialize database connection
     * @returns {Promise<void>}
     */
    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    reject(new Error(`Failed to connect to database: ${err.message}`));
                    return;
                }
                
                // Enable foreign keys
                this.db.run('PRAGMA foreign_keys = ON', (err) => {
                    if (err) {
                        reject(new Error(`Failed to enable foreign keys: ${err.message}`));
                        return;
                    }
                    resolve();
                });
            });
        });
    }

    /**
     * Close database connection
     * @returns {Promise<void>}
     */
    async close() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }
            
            this.db.close((err) => {
                if (err) {
                    reject(new Error(`Failed to close database: ${err.message}`));
                    return;
                }
                this.db = null;
                resolve();
            });
        });
    }

    /**
     * Get service type by ID
     * @param {number} serviceTypeId - Service type ID
     * @returns {Promise<Object>} Service type object
     */
    async getServiceType(serviceTypeId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM service_types WHERE id = ? AND is_active = 1';
            
            this.db.get(query, [serviceTypeId], (err, row) => {
                if (err) {
                    reject(new Error(`Database error: ${err.message}`));
                    return;
                }
                
                if (!row) {
                    reject(new Error(`Service type with ID ${serviceTypeId} not found or inactive`));
                    return;
                }
                
                resolve(row);
            });
        });
    }

    /**
     * Get the last ticket number for a service type today
     * @param {number} serviceTypeId - Service type ID
     * @returns {Promise<string|null>} Last ticket number or null
     */
    async getLastTicketNumber(serviceTypeId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT ticket_number 
                FROM tickets 
                WHERE service_type_id = ? 
                AND DATE(issued_at) = DATE('now')
                ORDER BY id DESC 
                LIMIT 1
            `;
            
            this.db.get(query, [serviceTypeId], (err, row) => {
                if (err) {
                    reject(new Error(`Database error: ${err.message}`));
                    return;
                }
                
                resolve(row ? row.ticket_number : null);
            });
        });
    }

    /**
     * Extract sequence number from ticket number
     * @param {string} ticketNumber - Ticket number (e.g., "A042")
     * @param {string} serviceCode - Service code (e.g., "A")
     * @returns {number} Sequence number
     */
    extractSequenceNumber(ticketNumber, serviceCode) {
        if (!ticketNumber) {
            return 0;
        }
        
        // Remove service code prefix
        const sequenceStr = ticketNumber.replace(serviceCode, '');
        const sequence = parseInt(sequenceStr, 10);
        
        return isNaN(sequence) ? 0 : sequence;
    }

    /**
     * Format ticket number
     * @param {string} serviceCode - Service code (e.g., "A")
     * @param {number} sequence - Sequence number
     * @param {number} digits - Number of digits (default: 3)
     * @returns {string} Formatted ticket number (e.g., "A001")
     */
    formatTicketNumber(serviceCode, sequence, digits = 3) {
        const paddedSequence = String(sequence).padStart(digits, '0');
        return `${serviceCode}${paddedSequence}`;
    }

    /**
     * Generate next ticket number for a service type
     * @param {number} serviceTypeId - Service type ID
     * @returns {Promise<Object>} Object with ticketNumber and serviceType
     */
    async generateTicketNumber(serviceTypeId) {
        try {
            // Validate service type exists and is active
            const serviceType = await this.getServiceType(serviceTypeId);
            
            // Get last ticket number for this service today
            const lastTicketNumber = await this.getLastTicketNumber(serviceTypeId);
            
            // Calculate next sequence number
            const currentSequence = this.extractSequenceNumber(
                lastTicketNumber, 
                serviceType.code
            );
            const nextSequence = currentSequence + 1;
            
            // Format new ticket number
            const ticketNumber = this.formatTicketNumber(
                serviceType.code, 
                nextSequence
            );
            
            return {
                ticketNumber,
                serviceType: {
                    id: serviceType.id,
                    name: serviceType.name,
                    code: serviceType.code
                },
                sequence: nextSequence,
                isFirstToday: nextSequence === 1
            };
            
        } catch (error) {
            throw new Error(`Failed to generate ticket number: ${error.message}`);
        }
    }

    /**
     * Validate ticket number format
     * @param {string} ticketNumber - Ticket number to validate
     * @param {string} serviceCode - Expected service code
     * @returns {boolean} True if valid
     */
    validateTicketNumberFormat(ticketNumber, serviceCode) {
        if (!ticketNumber || !serviceCode) {
            return false;
        }
        
        // Pattern: [Service Code][3 digits]
        const pattern = new RegExp(`^${serviceCode}\\d{3}$`);
        return pattern.test(ticketNumber);
    }

    /**
     * Check if ticket number exists
     * @param {string} ticketNumber - Ticket number to check
     * @returns {Promise<boolean>} True if exists
     */
    async ticketNumberExists(ticketNumber) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) as count FROM tickets WHERE ticket_number = ?';
            
            this.db.get(query, [ticketNumber], (err, row) => {
                if (err) {
                    reject(new Error(`Database error: ${err.message}`));
                    return;
                }
                
                resolve(row.count > 0);
            });
        });
    }

    /**
     * Get statistics for ticket generation
     * @param {number} serviceTypeId - Service type ID (optional)
     * @returns {Promise<Object>} Statistics object
     */
    async getGenerationStats(serviceTypeId = null) {
        return new Promise((resolve, reject) => {
            let query, params;
            
            if (serviceTypeId) {
                query = `
                    SELECT 
                        COUNT(*) as total_today,
                        MAX(ticket_number) as last_ticket,
                        MIN(issued_at) as first_issued,
                        MAX(issued_at) as last_issued
                    FROM tickets
                    WHERE service_type_id = ?
                    AND DATE(issued_at) = DATE('now')
                `;
                params = [serviceTypeId];
            } else {
                query = `
                    SELECT 
                        service_type_id,
                        COUNT(*) as total_today,
                        MAX(ticket_number) as last_ticket,
                        MIN(issued_at) as first_issued,
                        MAX(issued_at) as last_issued
                    FROM tickets
                    WHERE DATE(issued_at) = DATE('now')
                    GROUP BY service_type_id
                `;
                params = [];
            }
            
            if (serviceTypeId) {
                this.db.get(query, params, (err, row) => {
                    if (err) {
                        reject(new Error(`Database error: ${err.message}`));
                        return;
                    }
                    resolve(row || { total_today: 0, last_ticket: null });
                });
            } else {
                this.db.all(query, params, (err, rows) => {
                    if (err) {
                        reject(new Error(`Database error: ${err.message}`));
                        return;
                    }
                    resolve(rows || []);
                });
            }
        });
    }

    /**
     * Reset daily sequences (for testing or manual reset)
     * WARNING: This should typically be run by a scheduled job at midnight
     * @returns {Promise<Object>} Reset statistics
     */
    async resetDailySequences() {
        return new Promise((resolve, reject) => {
            // Mark old tickets as cancelled if still waiting/serving
            const query = `
                UPDATE tickets 
                SET status = 'CANCELLED', 
                    cancelled_at = CURRENT_TIMESTAMP 
                WHERE status IN ('WAITING', 'SERVING') 
                AND DATE(issued_at) < DATE('now')
            `;
            
            this.db.run(query, [], function(err) {
                if (err) {
                    reject(new Error(`Failed to reset sequences: ${err.message}`));
                    return;
                }
                
                resolve({
                    message: 'Daily sequences reset',
                    cancelled_tickets: this.changes,
                    reset_date: new Date().toISOString()
                });
            });
        });
    }
}

/**
 * Convenience function to generate ticket number without managing connection
 * @param {number} serviceTypeId - Service type ID
 * @returns {Promise<Object>} Generated ticket information
 */
async function generateTicketNumber(serviceTypeId) {
    const generator = new TicketNumberGenerator();
    try {
        await generator.connect();
        const result = await generator.generateTicketNumber(serviceTypeId);
        return result;
    } finally {
        await generator.close();
    }
}

/**
 * Convenience function to get generation stats
 * @param {number} serviceTypeId - Service type ID (optional)
 * @returns {Promise<Object>} Statistics
 */
async function getGenerationStats(serviceTypeId = null) {
    const generator = new TicketNumberGenerator();
    try {
        await generator.connect();
        const stats = await generator.getGenerationStats(serviceTypeId);
        return stats;
    } finally {
        await generator.close();
    }
}

// Export
module.exports = {
    TicketNumberGenerator,
    generateTicketNumber,
    getGenerationStats
};
