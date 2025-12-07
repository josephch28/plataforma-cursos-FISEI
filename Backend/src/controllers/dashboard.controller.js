// Backend/src/controllers/dashboard.controller.js
const pool = require('../db');

// Asegúrate de que se use "exports.nombreFuncion ="
exports.getGeneralStats = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) as total FROM usuario WHERE activo = 1');
    const [courses] = await pool.query('SELECT COUNT(*) as total FROM curso WHERE activo = 1');
    const [enrollments] = await pool.query('SELECT COUNT(*) as total FROM inscripcion');

    res.json({
      usuarios: users[0].total,
      cursos: courses[0].total,
      inscripciones: enrollments[0].total
    });
  } catch (error) {
    console.error('Error obteniendo stats generales:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas generales' });
  }
};

// Tendencia: inscripciones por día en los últimos N días (por defecto 9 días)
exports.getTrends = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 9;
    // Obtener inscripciones por fecha
    const [rows] = await pool.query(
      `SELECT DATE(fecha) as date, COUNT(*) as inscripciones
       FROM inscripcion
       WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(fecha)
       ORDER BY DATE(fecha)`,
      [days - 1]
    );

    // Normalizar: garantizar que haya una entrada para cada día
    const result = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const found = rows.find(r => String(r.date) === iso);
      result.push({ date: iso, inscripciones: found ? Number(found.inscripciones) : 0 });
    }

    res.json(result);
  } catch (error) {
    console.error('Error obteniendo tendencias del dashboard:', error);
    res.status(500).json({ message: 'Error al obtener tendencias' });
  }
};

// Distribución: conteo de cursos por tipo (o categoría)
exports.getDistribution = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COALESCE(tipo, 'Sin categoría') as name, COUNT(*) as value
       FROM curso
       WHERE activo = 1
       GROUP BY COALESCE(tipo, 'Sin categoría')`
    );

    res.json(rows.map(r => ({ name: r.name, value: Number(r.value) })));
  } catch (error) {
    console.error('Error obteniendo distribución del dashboard:', error);
    res.status(500).json({ message: 'Error al obtener distribución' });
  }
};