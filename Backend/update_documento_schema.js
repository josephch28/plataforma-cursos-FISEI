require('dotenv').config();
const pool = require('./src/db');

const updateSchema = async () => {
    try {
        console.log('Updating document schema...');

        // Add Link to Course
        try {
            await pool.query(`
                ALTER TABLE usuario_documento
                ADD COLUMN id_curso INT NULL AFTER cedula_usuario,
                ADD CONSTRAINT fk_doc_curso FOREIGN KEY (id_curso) REFERENCES curso(id_curso) ON DELETE CASCADE
            `);
            console.log("Column 'id_curso' added to usuario_documento.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("Column 'id_curso' already exists.");
            } else {
                console.log("Error adding id_curso (might exist or FK issue):", e.message);
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
