require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'plataforma_cursos'
};

console.log('Testing DB Access with config:', config);

(async () => {
    try {
        const conn = await mysql.createConnection(config);
        console.log('Success! Connected.');
        await conn.end();
    } catch (e) {
        console.error('Connection Failed:', e);
    }
})();
