require('dotenv').config();
const pool = require('./src/db');

async function addColumn() {
    try {
        // Add min_asistencia integer default 75
        await pool.query("ALTER TABLE curso ADD COLUMN min_asistencia INT DEFAULT 75");
        console.log('Column added successfully.');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
        } else {
            console.error('Error adding column:', err.message);
        }
    }
    process.exit();
}

addColumn();
