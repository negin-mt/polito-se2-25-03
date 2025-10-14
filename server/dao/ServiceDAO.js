const sqlite = require('sqlite3')

const db = new sqlite.Database('queue_management.db', (err) => {
    if (err) throw err;
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