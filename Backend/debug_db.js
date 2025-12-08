require('dotenv').config();
const pool = require('./src/db');

async function fixColumn() {
    try {
        // 1. Change column type
        console.log('Altering column...');
        await pool.query("ALTER TABLE solicitudes_cambio MODIFY COLUMN asignado_a VARCHAR(20)");
        console.log('Column altered to VARCHAR(20).');

        // 2. Try to fix existing broken IDs (1 -> 0000000001) if they match specific pattern
        // This is optional but helpful for the user's specific case "0000000001"
        const [rows] = await pool.query("SELECT id, asignado_a FROM solicitudes_cambio WHERE asignado_a = '1'");
        if (rows.length > 0) {
            console.log(`Found ${rows.length} rows with ID '1'. Updating to '0000000001'...`);
            await pool.query("UPDATE solicitudes_cambio SET asignado_a = '0000000001' WHERE asignado_a = '1'");
            console.log('Update complete.');
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit();
}

fixColumn();
