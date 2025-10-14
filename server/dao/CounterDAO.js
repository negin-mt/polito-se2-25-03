const sqlite = require('sqlite3')

const db = new sqlite.Database('../db/queue_management.db', (err) => {
    if (err) throw err;
});