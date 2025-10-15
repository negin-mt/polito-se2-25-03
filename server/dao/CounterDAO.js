const sqlite = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, '../db/queue_management.db');

const db = new sqlite.Database(DB_PATH, sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, (err) => {
    if (err) {
        console.error('❌ CounterDAO - Error opening database:', err.message);
        throw err;
    }
    console.log('✅ CounterDAO - Database connected');
});

/**
 * Get all counters
 */
const getAllCounters = async () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT c.*, st.name as service_type_name, st.code as service_type_code
            FROM counters c
            LEFT JOIN service_types st ON c.service_type_id = st.id
            ORDER BY c.counter_number
        `;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * Get counter by ID
 */
const getCounterById = async (counter_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT c.*, st.name as service_type_name, st.code as service_type_code
            FROM counters c
            LEFT JOIN service_types st ON c.service_type_id = st.id
            WHERE c.id = ?
        `;
        db.get(sql, [counter_id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

/**
 * Get all active counters for a specific service type
 */
const getActiveCountersByServiceType = async (service_type_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT c.*, st.name as service_type_name, st.code as service_type_code
            FROM counters c
            LEFT JOIN service_types st ON c.service_type_id = st.id
            WHERE c.service_type_id = ? AND c.is_active = 1
            ORDER BY c.counter_number
        `;
        db.all(sql, [service_type_id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * Count active counters for a specific service type
 */
const countActiveCountersByServiceType = async (service_type_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT COUNT(*) as count
            FROM counters
            WHERE service_type_id = ? AND is_active = 1
        `;
        db.get(sql, [service_type_id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.count || 0);
            }
        });
    });
};

/**
 * Update counter active status
 */
const updateCounterStatus = async (counter_id, is_active) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE counters
            SET is_active = ?
            WHERE id = ?
        `;
        db.run(sql, [is_active ? 1 : 0, counter_id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

/**
 * Get counters currently serving (have tickets with status SERVING)
 */
const getServingCounters = async (service_type_id = null) => {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT DISTINCT c.*, t.ticket_number, t.id as current_ticket_id
            FROM counters c
            INNER JOIN tickets t ON c.id = t.counter_id
            WHERE t.status = 'SERVING'
        `;
        const params = [];
        
        if (service_type_id) {
            sql += ` AND c.service_type_id = ?`;
            params.push(service_type_id);
        }
        
        sql += ` ORDER BY c.counter_number`;
        
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

module.exports = {
    getAllCounters,
    getCounterById,
    getActiveCountersByServiceType,
    countActiveCountersByServiceType,
    updateCounterStatus,
    getServingCounters
};
