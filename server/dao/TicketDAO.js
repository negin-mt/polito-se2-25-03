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
        FROM tickets
        ORDER BY id DESC`
        db.all(sql, [], function (err, rows) {
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

const getQueueStatus = async (serviceTypeId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                st.id as serviceTypeId,
                st.name as serviceTypeName,
                COUNT(CASE WHEN t.status = 'WAITING' THEN 1 END) as waitingTickets,
                COUNT(CASE WHEN t.status = 'SERVING' THEN 1 END) as activeCounters,
                MAX(CASE WHEN t.status = 'WAITING' THEN t.ticket_number END) as lastTicketNumber,
                st.average_service_time as estimatedWaitTime
            FROM service_types st
            LEFT JOIN tickets t ON st.id = t.service_type_id 
                AND DATE(t.issued_at) = DATE('now')
            WHERE st.id = ? AND st.is_active = 1
            GROUP BY st.id, st.name, st.average_service_time
        `;
        
        db.get(sql, [serviceTypeId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                // Ensure we always return valid numbers
                const result = {
                    serviceTypeId: row?.serviceTypeId || serviceTypeId,
                    serviceTypeName: row?.serviceTypeName || 'Unknown Service',
                    waitingTickets: row?.waitingTickets || 0,
                    activeCounters: row?.activeCounters || 0,
                    lastTicketNumber: row?.lastTicketNumber || null,
                    estimatedWaitTime: row?.estimatedWaitTime || 10
                };
                resolve(result);
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
    findTicketsByStatus,
    getQueueStatus
}
