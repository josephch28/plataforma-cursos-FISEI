require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function updateDB() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'plataforma_cursos',
    });

    try {
        console.log('Conectando a la base de datos...');
        const connection = await pool.getConnection();
        console.log('Conexión exitosa.');

        // Check if columns exist
        const [columns] = await connection.query("SHOW COLUMNS FROM solicitudes_cambio");
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('categoria')) {
            console.log('Agregando columna categoria...');
            await connection.query("ALTER TABLE solicitudes_cambio ADD COLUMN categoria VARCHAR(50) AFTER tipo_cambio");
        } else {
            console.log('Columna categoria ya existe.');
        }

        if (!columnNames.includes('entornos')) {
            console.log('Agregando columna entornos...');
            await connection.query("ALTER TABLE solicitudes_cambio ADD COLUMN entornos TEXT AFTER impacto");
        } else {
            console.log('Columna entornos ya existe.');
        }

        console.log('Actualización de esquema completada.');
        connection.release();
    } catch (err) {
        console.error('Error actualizando BD:', err);
    } finally {
        await pool.end();
    }
}

updateDB();
