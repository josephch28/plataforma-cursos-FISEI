require('dotenv').config();
const pool = require('./src/db');

const updateSchema = async () => {
    try {
        console.log('Updating schema...');

        // Add 'tipo' column to curso_requisito if not exists
        // Since MySQL IF NOT EXISTS on ADD COLUMN is tricky in older versions, we assume it might fail if exists or check first.
        // Or simpler: TRY adding, catch "Duplicate column" error.

        try {
            await pool.query(`
                ALTER TABLE curso_requisito
                ADD COLUMN tipo ENUM('GENERAL', 'ESPECIFICO') DEFAULT 'ESPECIFICO' AFTER id_curso
            `);
            console.log("Column 'tipo' added to curso_requisito.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("Column 'tipo' already exists.");
            } else {
                throw e;
            }
        }

        console.log('Schema updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', JSON.stringify(err, null, 2));
        process.exit(1);
    }
};

updateSchema();
