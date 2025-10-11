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
        this.db.all(`SELECT * FROM tickets WHERE id = ?`, [ticketId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows || null);
        });
    });
}

async findByServiceType(serviceTypeId){
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT * FROM tickets WHERE service_type_id = ? AND status = 'WAITING' ORDER BY issued_at ASC`, [serviceTypeId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows || null);
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
    this.ticketNumberGenerator = new TicketNumberGenerator();  
    }
     /**
   * Crea e registra un nuovo ticket
   * @param {number} serviceTypeId
   * @returns {Promise<object>} Ticket creato
   */
  async issueTicket(serviceTypeId){
    const serviceType = await this.serviceRepository.findById(serviceTypeId);
    if(!serviceType){
        throw new Error('Invalid service type');
    }
    await this.ticketNumberGenerator.connect();
    const ticketData = await this.ticketNumberGenerator.generateTicketNumber(serviceTypeId);
    const ticketNumber = ticketData.ticketNumber;
    const waitingTickets = await this.ticketRepository.findByServiceType(serviceTypeId);
    const positionInQueue = waitingTickets.length + 1;

    const newTicket = {
        ticket_number: ticketNumber,
        service_type_id: serviceTypeId,
        status: 'WAITING',
        issued_at: new Date().toISOString(),
        queue_position: positionInQueue
    };
    const savedTicketId = await this.ticketRepository.save(newTicket);
   
    const queue = await this.ticketRepository.findByServiceType(serviceTypeId);
    
    return {
        id: savedTicketId.id || savedTicketId,
        ...newTicket,
        queuePosition: positionInQueue,
        serviceType: serviceType
    }
  }
   /**
   * Ottiene info di un ticket
   * @param {number} ticketId
   * @returns {Promise<object|null>}
   */
async getTicketInfo(ticketId){
    const ticket = await this.ticketRepository.findById(ticketId);
    if(!ticket){
        return null;
    }
    return ticket;
}
  /**
   * Ottiene stato della coda per un dato servizio
   * @param {number} serviceTypeId
   * @returns {Promise<object>}
   */
async getQueueStatus(serviceTypeId){
    const serviceType = await this.serviceRepository.findById(serviceTypeId);
    if(!serviceType){
        throw new Error('Invalid service type');
    }
    const tickets = await this.ticketRepository.findByServiceType(serviceTypeId);
    return {
        serviceType: serviceType,
        waitingTickets: tickets.length,
        tickets: tickets
    };
}
}

module.exports = TicketService;