import sqlite from 'sqlite3';

const db = new sqlite.Database('database.sqlite', (err) => {
    if (err) throw err;
});

export const addTicket = async (status, created_at, predicted_hour, service_id, counter_id, ticket_number) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO TICKET (status, created_at, predicted_hour, service_id, counter_id, ticket_number) 
                            VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(sql, [status, created_at, predicted_hour, service_id, counter_id, ticket_number],
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
        FROM TICKET`
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
                            FROM TICKET
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
        FROM TICKET
        WHERE ticket_number = ?`;
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
        FROM TICKET
        WHERE service_id = ?
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
        FROM TICKET  
        WHERE service_id = ?;`
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
        FROM TICKET
        WHERE service_id = ?
        ORDER BY created_at
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



