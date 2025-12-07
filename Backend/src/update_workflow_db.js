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

        // 1. Modificar ENUM de usuario.rol para agregar 'comite'
        // Nota: Es arriesgado hacer ALTER TABLE modify column enum si hay datos que no coinciden, pero 'comite' es nuevo.
        // Asumimos que los roles existentes son: 'admin','responsable','usuario','develop'
        console.log("Actualizando enum usuario.rol...");
        await connection.query("ALTER TABLE usuario MODIFY COLUMN rol ENUM('admin','responsable','usuario','develop','comite') DEFAULT 'usuario'");

        // 2. Modificar ENUM de solicitudes_cambio.estado
        // Estados actuales: 'pendiente','realizado'
        // Nuevos estados: 'pendiente','aprobado','rechazado','realizado','verificado'
        console.log("Actualizando enum solicitudes_cambio.estado...");
        await connection.query("ALTER TABLE solicitudes_cambio MODIFY COLUMN estado ENUM('pendiente','realizado','aprobado','rechazado','verificado') DEFAULT 'pendiente'");

        // 3. Agregar columna asignado_a (INT)
        const [columns] = await connection.query("SHOW COLUMNS FROM solicitudes_cambio");
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('asignado_a')) {
            console.log('Agregando columna asignado_a...');
            // Se puede hacer FK a usuario(id), pero por simplicidad solo agregamos la columna
            await connection.query("ALTER TABLE solicitudes_cambio ADD COLUMN asignado_a INT DEFAULT NULL AFTER estado");
        } else {
            console.log('Columna asignado_a ya existe.');
        }

        console.log('Actualización de esquema para Workflow completada.');
        connection.release();
    } catch (err) {
        console.error('Error actualizando BD:', err);
    } finally {
        await pool.end();
    }
}

updateDB();
