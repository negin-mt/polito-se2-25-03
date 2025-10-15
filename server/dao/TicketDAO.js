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

// Helper function to calculate queue position
const calculateQueuePosition = async (ticketId, serviceTypeId, issuedAt) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT COUNT(*) + 1 as position
            FROM tickets
            WHERE service_type_id = ?
            AND status = 'WAITING'
            AND issued_at < ?
            AND id != ?
        `;
        db.get(sql, [serviceTypeId, issuedAt, ticketId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.position);
            }
        });
    });
};



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
        const sql = `
            SELECT t.*, st.name as service_name, st.code as service_code
            FROM tickets t
            LEFT JOIN service_types st ON t.service_type_id = st.id
            WHERE t.id = ?;
        `;
        db.get(sql, [ticket_id], async (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                if (row && row.status === 'WAITING') {
                    try {
                        const queuePosition = await calculateQueuePosition(row.id, row.service_type_id, row.issued_at);
                        row.queue_position = queuePosition;
                    } catch (posErr) {
                        console.error('Error calculating queue position:', posErr);
                        row.queue_position = null;
                    }
                }
                resolve(row);
            }
        });
    });
}

const findByTicketNumber = async (ticket_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT t.*, st.name as service_name, st.code as service_code
            FROM tickets t
            LEFT JOIN service_types st ON t.service_type_id = st.id
            WHERE t.ticket_number = ?;
        `;
        db.get(sql, [ticket_id], async (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                if (row && row.status === 'WAITING') {
                    try {
                        const queuePosition = await calculateQueuePosition(row.id, row.service_type_id, row.issued_at);
                        row.queue_position = queuePosition;
                    } catch (posErr) {
                        console.error('Error calculating queue position:', posErr);
                        row.queue_position = null;
                    }
                }
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
// ---- FIX: getNextInQueue deve considerare solo WAITING e ordine asc
const getNextInQueue = async (service_type_id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT *
        FROM tickets
        WHERE service_type_id = ?
        AND status = 'WAITING'
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
// ---- FIX: deleteTicket: correggo parametri e filtro per id
const deleteTicket = async (ticket_id, timestamp = null) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE tickets
             SET cancelled_at = CURRENT_TIMESTAMP, 
                 status = 'CANCELED'
             WHERE id = ?;`;
        db.run(sql, [ticket_id], (err) => {
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
                COUNT(CASE WHEN t.status = 'SERVING' THEN 1 END) as servingTickets,
                MAX(CASE WHEN t.status = 'WAITING' THEN t.ticket_number END) as lastTicketNumber,
                st.average_service_time as estimatedWaitTime,
                (SELECT COUNT(*) FROM counters c WHERE c.service_type_id = st.id AND c.is_active = 1) as activeCounters
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
                    servingTickets: row?.servingTickets || 0,
                    activeCounters: row?.activeCounters || 0,
                    lastTicketNumber: row?.lastTicketNumber || null,
                    estimatedWaitTime: row?.estimatedWaitTime || 10
                };
                resolve(result);
            }
        });
    });
}

// Find next ticket to be served for a given service type 
const findNextWaitingTicket = async (service_type_id) => {
    return new Promise((resolve, reject) =>{
            const sql = `
      SELECT *
      FROM tickets
      WHERE service_type_id = ?
        AND status = 'WAITING'
      ORDER BY issued_at ASC
      LIMIT 1
    `;
    db.get(sql, [service_type_id], (err, row) => {
    if (err) {
        reject(err);    
    }else 
        resolve(row);
    });
    });
};

//find ticket by counter end possibly by status
const findTicketsByCounter = async (counter_id, status_ = null) =>{
    return new Promise((resolve, reject) =>{
        const base = 'SELECT * FROM tickets WHERE counter_id = ?';
        const sql = status_ ? `${base} AND status = ? ORDER BY issued_at DESC` : `${base} ORDER BY issued_at DESC`;
        const params = status_ ? [counter_id, status_] : [counter_id];
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
};

// Passing from wainting to serving
const updateTicketToServing = async (ticket_id, counter_id, officerName = null) => {
    return new Promise((resolve, reject) => {
        const sql = `
      UPDATE tickets
      SET status = 'SERVING',
        counter_id = ?,
        called_at = CURRENT_TIMESTAMP,
        notes = CASE
                    WHEN ? IS NULL OR ? = '' THEN notes
                    ELSE TRIM(COALESCE(notes, '') || CASE WHEN notes IS NULL OR notes = '' THEN '' ELSE ' | ' END || 'officer=' || ?)
                  END
      WHERE id = ? AND status = 'WAITING'
    `;
    db.run(sql, [counter_id, officerName, officerName, officerName, ticket_id], function (err) {
        if (err) {
            reject(err);
        } else {
            resolve(this.changes); // Number of rows updated
        }
    });
    });
};

// completing the ticket
const completeTicket = async (ticket_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
      UPDATE tickets
      SET status = 'COMPLETED',
        completed_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'SERVING'
    `;
    db.run(sql, [ticket_id], function (err) {
        if (err) {
            reject(err);
        } else {
            resolve(this.changes); // Number of rows updated
        }
    });
    });
};
const findCurrentTicketForCounter = async (counter_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM tickets
      WHERE counter_id = ?
        AND status = 'SERVING'
      LIMIT 1
    `;
    db.get(sql, [counter_id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};


module.exports = {
    addTicket,
    getAllTickets,
    getTicketById,
    findByTicketNumber,
    getNextInQueue,
    deleteTicket,
    findWaitingTicketsByServiceType,
    findTicketsByStatus,
    getQueueStatus,
    findNextWaitingTicket,
    findTicketsByCounter,
    updateTicketToServing,
    completeTicket,
    findCurrentTicketForCounter
}
