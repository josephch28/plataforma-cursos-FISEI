// Backend/src/controllers/usuarios.controller.js - MODIFICADO

const pool = require('../db');
const bcrypt = require('bcryptjs');

const sanitizeUser = (user) => {
  if (user && user.password) {
    delete user.password;
  }
  return user;
};

exports.list = async (req, res) => {
  try {
    const { inactivo } = req.query;

    // Determinar si buscamos usuarios INACTIVOS.
    // req.query.inactivo será el string 'true' o 'false'.
    const searchInactive = inactivo === 'true';

    // En MySQL, TRUE es 1 y FALSE es 0. 
    // Si searchInactive es TRUE, queremos activo = 0 (usuarios inactivos).
    // Si searchInactive es FALSE, queremos activo = 1 (usuarios activos).
    const activeValue = searchInactive ? 0 : 1;

    // Usamos un placeholder (?) para pasar el valor numérico, 
    // garantizando que MySQL filtre correctamente.
    const [rows] = await pool.query(
      'SELECT cedula, nombre, apellido, email, rol, activo FROM usuario WHERE activo = ?',
      [activeValue]
    );

    res.json(rows.map(sanitizeUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.get = async (req, res) => {
  try {
    // Obtener usuario independientemente de su estado (activo/inactivo)
    const [rows] = await pool.query('SELECT cedula, nombre, apellido, email, rol, activo FROM usuario WHERE cedula = ?', [req.params.cedula]);
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(sanitizeUser(rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

exports.create = async (req, res) => {
  try {
    const { cedula, nombre, apellido, email, rol, password } = req.validated;
    const rolNormalized = (rol || '').toLowerCase();

    // NOTA: El password DEBE ser hasheado con bcrypt en producción.

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.query(
      'INSERT INTO usuario (cedula, nombre, apellido, email, rol, password, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [cedula, nombre, apellido, email, rolNormalized, passwordHash] // <-- USA passwordHash
    );

    const [row] = await pool.query('SELECT cedula, nombre, apellido, email, rol, activo FROM usuario WHERE cedula = ?', [cedula]);
    res.status(201).json(sanitizeUser(row[0]));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El usuario con esa cédula ya existe' });
    }
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

exports.update = async (req, res) => {
  try {
    const b = req.validated;
    const { cedula } = req.params;

    const fields = [];
    const params = [];

    for (const k in b) {
      if (k === 'rol' && typeof b[k] === 'string') {
        fields.push(`${k} = ?`);
        params.push(b[k].toLowerCase());
        continue;
      }

      // --- INICIO DE CAMBIO ---
      if (k === 'password') {
        // Si se incluye el password, hashearlo
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(b[k], salt);
        fields.push(`${k} = ?`);
        params.push(passwordHash);
      } else {
        // Para todos los demás campos
        fields.push(`${k} = ?`);
        params.push(b[k]);
      }
    }
    if (!fields.length) return res.status(400).json({ message: 'Nada para actualizar' });

    params.push(cedula);
    await pool.query(`UPDATE usuario SET ${fields.join(', ')} WHERE cedula = ?`, params);

    const [row] = await pool.query('SELECT cedula, nombre, apellido, email, rol, activo FROM usuario WHERE cedula = ?', [cedula]);
    res.json(sanitizeUser(row[0]));
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

// MODIFICADO: Borrado Lógico (Desactivación)
exports.remove = async (req, res) => {
  try {
    // Cambia el estado del usuario a inactivo (FALSE = 0)
    await pool.query('UPDATE usuario SET activo = 0 WHERE cedula = ?', [req.params.cedula]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error al desactivar usuario' });
  }
};

// NUEVO: Reactivación Lógica
exports.activate = async (req, res) => {
  try {
    // Cambia el estado del usuario a activo (TRUE = 1)
    await pool.query('UPDATE usuario SET activo = 1 WHERE cedula = ?', [req.params.cedula]);
    res.status(200).json({ message: 'Usuario activado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al activar usuario' });
  }
};