const sqlite = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, '../db/queue_management.db');

const db = new sqlite.Database(DB_PATH, sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, (err) => {
    if (err) {
        console.error('❌ ServiceDAO - Error opening database:', err.message);
        throw err;
    }
    console.log('✅ ServiceDAO - Database connected');
});



const getAllServices = async () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM service_types WHERE id = ?`;
        db.all(sql, (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
}

const getService = async (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM service_types WHERE id = ?`;
        db.get(sql, [id], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

const getActiveServices = async () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM service_types WHERE is_active = TRUE`;
        db.all(sql, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

module.exports = {
    getAllServices,
    getService,
    getActiveServices,
}