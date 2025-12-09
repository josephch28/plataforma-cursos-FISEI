require('dotenv').config({ path: './src/.env' }); // try generic or specific path if needed, usually just .config() if in root.
// actually user .env is in Backend root?
require('dotenv').config();
const pool = require('./src/db');

const createTables = async () => {
    try {
        console.log('Creating tables...');

        await pool.query(`
      CREATE TABLE IF NOT EXISTS curso_requisito (
        id_requisito INT AUTO_INCREMENT PRIMARY KEY,
        id_curso INT NOT NULL,
        nombre_requisito VARCHAR(100) NOT NULL,
        descripcion TEXT,
        obligatorio BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_curso) REFERENCES curso(id_curso) ON DELETE CASCADE
      );
    `);

        await pool.query(`
      CREATE TABLE IF NOT EXISTS usuario_documento (
        id_documento INT AUTO_INCREMENT PRIMARY KEY,
        cedula_usuario VARCHAR(15) NOT NULL,
        id_curso INT NULL, 
        tipo_documento VARCHAR(50) NOT NULL, 
        nombre_archivo VARCHAR(255),
        ruta_archivo TEXT NOT NULL,
        estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
        observacion TEXT,
        fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cedula_usuario) REFERENCES usuario(cedula) ON DELETE CASCADE,
        FOREIGN KEY (id_curso) REFERENCES curso(id_curso) ON DELETE CASCADE
      );
    `);

        console.log('Tables created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating tables:', JSON.stringify(err, null, 2));
        process.exit(1);
    }
};

createTables();
