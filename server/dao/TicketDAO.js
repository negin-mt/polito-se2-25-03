import sqlite from 'sqlite3';

const db = new sqlite.Database('queue_management.db', (err) => {
    if (err) throw err;
});

export const addTicket = async (ticket_number, service_type_id, status, counter_id,
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

export const getAllTickets = async () => {
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

export const getTicketById = async (ticket_id) => {
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

export const findByTicketNumber = async (ticket_id) => {
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

export const findWaitingTicketsByServiceType = async (service_type_id) => {
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

export const findTicketsByStatus = async (service_type_id) => {
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

export const getNextInQueue = async (service_type_id) => {
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



