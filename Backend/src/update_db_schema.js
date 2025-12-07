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

        // 1. Solicitudes Cambio Columns
        const [columns] = await connection.query("SHOW COLUMNS FROM solicitudes_cambio");
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('categoria')) {
            console.log('Agregando columna categoria...');
            await connection.query("ALTER TABLE solicitudes_cambio ADD COLUMN categoria VARCHAR(50) AFTER tipo_cambio");
        }

        if (!columnNames.includes('entornos')) {
            console.log('Agregando columna entornos...');
            await connection.query("ALTER TABLE solicitudes_cambio ADD COLUMN entornos TEXT AFTER impacto");
        }

        if (!columnNames.includes('fecha_termino')) {
            console.log('Agregando columna fecha_termino...');
            await connection.query("ALTER TABLE solicitudes_cambio ADD COLUMN fecha_termino DATETIME AFTER estado");
        }

        // 2. Curso Columns
        const [cursoCols] = await connection.query("SHOW COLUMNS FROM curso");
        const cursoColNames = cursoCols.map(c => c.Field);

        if (!cursoColNames.includes('estado')) {
            console.log('Agregando columna estado a tabla curso...');
            await connection.query("ALTER TABLE curso ADD COLUMN estado ENUM('creado', 'activo', 'finalizado') DEFAULT 'creado' AFTER activo");
            await connection.query("UPDATE curso SET estado = IF(activo = 1, 'activo', 'creado')");
        }

        if (!cursoColNames.includes('fecha_inicio_inscripcion')) {
            console.log('Agregando fechas inscripcion...');
            await connection.query("ALTER TABLE curso ADD COLUMN fecha_inicio_inscripcion DATE AFTER estado");
            await connection.query("ALTER TABLE curso ADD COLUMN fecha_fin_inscripcion DATE AFTER fecha_inicio_inscripcion");
        }

        // 3. Certificados Table
        console.log('Verificando tabla certificados...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS certificados (
                id_certificado INT AUTO_INCREMENT PRIMARY KEY,
                id_inscripcion INT NOT NULL,
                codigo_verificacion VARCHAR(64) UNIQUE NOT NULL,
                fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
                url_pdf VARCHAR(255),
                FOREIGN KEY (id_inscripcion) REFERENCES inscripcion(id_inscripcion) ON DELETE CASCADE
            )
        `);

        console.log('Actualización de esquema completada.');
        connection.release();
    } catch (err) {
        console.error('Error actualizando BD:', err);
    } finally {
        await pool.end();
    }
}

updateDB();
