const sqlite = require("sqlite3").verbose();
const path = require("path");

// Path assoluto che funziona sempre
const DB_PATH = path.join(__dirname, '../db/queue_management.db');

// Apri con flag CREATE per creare il file se non esiste
const db = new sqlite.Database(DB_PATH, sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, (err) => {
    if (err) {
        console.error('❌ TicketDAO - Error opening database:', err.message);
        throw err;
    }
    console.log('✅ TicketDAO - Database connected');
});



const addTicket = async (ticket_number, service_type_id, status, counter_id,
                                issued_at, called_at, completed_at, cancelled_at, notes) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO tickets (ticket_number, service_type_id, status, counter_id,
                            issued_at, called_at, completed_at, cancelled_at, notes) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [ticket_number, service_type_id, status, counter_id,
                issued_at, called_at, completed_at, cancelled_at, notes],
            function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.lastID);
                }
            });
    });
}

const getAllTickets = async () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT *
        FROM tickets`
        db.get(sql, [], function (err, rows) {
            if (err){
                reject(err);
            }
            else {
                resolve(rows);
            }
        })
    })
}

const getTicketById = async (ticket_id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * 
                            FROM tickets
                            WHERE id = ?;`;
        db.get(sql, [ticket_id], (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(row);
            }
        });
    });
}

const findByTicketNumber = async (ticket_id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT *
        FROM tickets
        WHERE ticket_number= ?;`;
        db.get(sql, [ticket_id], (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(row);
            }
        });
    });
}

const findWaitingTicketsByServiceType = async (service_type_id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT *
        FROM tickets
        WHERE service_type_id = ?
        AND status = 'WAITING';`
        db.get(sql, [service_type_id], (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(row);
            }
        });
    });
}

const findTicketsByStatus = async (service_type_id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT *
        FROM tickets  
        WHERE service_type_id = ?;`
        db.get(sql, [service_type_id], (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(row);
            }
        });
    });
}

const getNextInQueue = async (service_type_id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT *
        FROM tickets
        WHERE service_type_id = ?
        ORDER BY issued_at
        LIMIT 1`;
        db.get(sql, [service_type_id], (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(row);
            }
        });
    });
}

const deleteTicket = async (ticket_id, timestamp) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE tickets
             SET cancelled_at = ?, 
                 status = 'CANCELED'
             WHERE ticket_number = ?;`;
        db.run(sql, [ticket_id, timestamp], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(this.lastID);
            }
        });
    });
}

module.exports = {
    addTicket,
    getAllTickets,
    getTicketById,
    findByTicketNumber,
    getNextInQueue,
    deleteTicket,
    findWaitingTicketsByServiceType,
    findTicketsByStatus
}
