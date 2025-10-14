/**
 * Database Initialization Script
 * 
 * This script initializes the SQLite database for the Office Queue Management System
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'queue_management.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

/**
 * Initialize the database
 * - Creates database file if it doesn't exist
 * - Executes schema.sql to create tables, indexes, views, triggers
 * - Inserts sample data
 */
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        console.log('🚀 Initializing Office Queue Management Database...\n');

        // Create database connection
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Error creating database:', err.message);
                reject(err);
                return;
            }
            console.log('✅ Database file created/connected:', DB_PATH);
        });

        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) {
                console.error('❌ Error enabling foreign keys:', err.message);
                reject(err);
                return;
            }
            console.log('✅ Foreign keys enabled');
        });

        // Read schema file
        let schema;
        try {
            schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
            console.log('✅ Schema file loaded');
        } catch (err) {
            console.error('❌ Error reading schema file:', err.message);
            db.close();
            reject(err);
            return;
        }

        // Execute schema
        db.exec(schema, (err) => {
            if (err) {
                console.error('❌ Error executing schema:', err.message);
                db.close();
                reject(err);
                return;
            }
            
            console.log('✅ Database schema created successfully\n');
            console.log('📊 Database Structure:');
            console.log('   - Tables: service_types, counters, tickets');
            console.log('   - Indexes: 8 indexes for performance');
            console.log('   - Views: active_queue, queue_statistics');
            console.log('   - Triggers: Auto-update timestamps');
            console.log('   - Sample Data: 4 service types, 5 counters\n');

            // Close database
            db.close((err) => {
                if (err) {
                    console.error('❌ Error closing database:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Database connection closed');
                console.log('🎉 Database initialization complete!\n');
                resolve();
            });
        });
    });
}

/**
 * Reset database (drop and recreate)
 * WARNING: This will delete all data!
 */
function resetDatabase() {
    return new Promise((resolve, reject) => {
        console.log('⚠️  Resetting database (this will delete all data)...\n');

        // Check if database exists
        if (fs.existsSync(DB_PATH)) {
            try {
                fs.unlinkSync(DB_PATH);
                console.log('✅ Old database file deleted');
            } catch (err) {
                console.error('❌ Error deleting database file:', err.message);
                reject(err);
                return;
            }
        }

        // Initialize fresh database
        initializeDatabase()
            .then(() => resolve())
            .catch((err) => reject(err));
    });
}

/**
 * Verify database structure
 */
function verifyDatabase() {
    return new Promise((resolve, reject) => {
        console.log('🔍 Verifying database structure...\n');

        const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error('❌ Error opening database:', err.message);
                reject(err);
                return;
            }
        });

        // Check tables
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
            if (err) {
                console.error('❌ Error querying tables:', err.message);
                db.close();
                reject(err);
                return;
            }

            console.log('📋 Tables:', tables.map(t => t.name).join(', '));

            // Check service types
            db.all('SELECT * FROM service_types', [], (err, serviceTypes) => {
                if (err) {
                    console.error('❌ Error querying service_types:', err.message);
                    db.close();
                    reject(err);
                    return;
                }

                console.log(`✅ Service Types: ${serviceTypes.length} records`);
                serviceTypes.forEach(st => {
                    console.log(`   - ${st.code}: ${st.name}`);
                });

                // Check counters
                db.all('SELECT * FROM counters', [], (err, counters) => {
                    if (err) {
                        console.error('❌ Error querying counters:', err.message);
                        db.close();
                        reject(err);
                        return;
                    }

                    console.log(`✅ Counters: ${counters.length} records`);
                    
                    console.log('\n🎉 Database verification complete!\n');
                    
                    db.close();
                    resolve();
                });
            });
        });
    });
}

// Export functions
module.exports = {
    initializeDatabase,
    resetDatabase,
    verifyDatabase,
    DB_PATH
};

// Run if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--reset')) {
        resetDatabase()
            .then(() => process.exit(0))
            .catch((err) => {
                console.error('Failed to reset database:', err);
                process.exit(1);
            });
    } else if (args.includes('--verify')) {
        verifyDatabase()
            .then(() => process.exit(0))
            .catch((err) => {
                console.error('Failed to verify database:', err);
                process.exit(1);
            });
    } else {
        initializeDatabase()
            .then(() => process.exit(0))
            .catch((err) => {
                console.error('Failed to initialize database:', err);
                process.exit(1);
            });
    }
}