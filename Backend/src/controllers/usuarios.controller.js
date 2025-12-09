// Backend/src/controllers/usuarios.controller.js - MODIFICADO

const pool = require('../db');

const sanitizeUser = (user) => {
  if (user && user.password) {
    delete user.password;
  }
  return user;
};

exports.list = async (req, res) => {
  try {
    const { inactivo, rol } = req.query; // <--- Extraemos rol

    // Filtro de activo/inactivo
    const searchInactive = inactivo === 'true';
    const activeValue = searchInactive ? 0 : 1;

    let query = 'SELECT cedula, nombre, apellido, email, rol, es_estudiante_uta, es_personal_uta, activo FROM usuario WHERE activo = ?';
    const params = [activeValue];

    // Filtro de rol
    if (rol) {
      query += ' AND rol = ?';
      params.push(rol);
    }

    const [rows] = await pool.query(query, params);

    res.json(rows.map(sanitizeUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.get = async (req, res) => {
  try {
    // Obtener usuario independientemente de su estado (activo/inactivo)
    const [rows] = await pool.query('SELECT cedula, nombre, apellido, email, rol, es_estudiante_uta, es_personal_uta, activo FROM usuario WHERE cedula = ?', [req.params.cedula]);
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(sanitizeUser(rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

exports.create = async (req, res) => {
  try {
    const { cedula, nombre, apellido, email, rol, password, es_estudiante_uta, es_personal_uta } = req.validated;
    const rolNormalized = (rol || '').toLowerCase();

    const [cedulaCheck] = await pool.query('SELECT cedula FROM usuario WHERE cedula = ?', [cedula]);
    if (cedulaCheck.length) {
      return res.status(409).json({ message: 'El usuario con esa cédula ya existe' });
    }

    const [emailCheck] = await pool.query('SELECT email FROM usuario WHERE email = ?', [email]);
    if (emailCheck.length) {
      return res.status(409).json({ message: 'El usuario con ese email ya existe' });
    }

    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // NOTA: El password DEBE ser hasheado con bcrypt en producción.
    await pool.query(
      'INSERT INTO usuario (cedula, nombre, apellido, email, rol, es_estudiante_uta, es_personal_uta, password, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
      // Usar !! para asegurar que los booleanos se guardan como 0 o 1 (TINYINT)
      [cedula, nombre, apellido, email, rolNormalized, !!es_estudiante_uta, !!es_personal_uta, hashedPassword]
    );

    const [row] = await pool.query('SELECT cedula, nombre, apellido, email, rol, es_estudiante_uta, es_personal_uta, activo FROM usuario WHERE cedula = ?', [cedula]);
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

    if (b.email) {
      const [emailCheck] = await pool.query(
        // Busca si existe el email, EXCLUYENDO la cédula del usuario actual
        'SELECT email FROM usuario WHERE email = ? AND cedula != ?',
        [b.email, cedula]
      );
      if (emailCheck.length) {
        return res.status(409).json({ message: 'El email ya está registrado para otro usuario' });
      }
    }

    // ¡NUEVO! Importar bcrypt aquí también
    const bcrypt = require('bcrypt');

    const fields = [];
    const params = [];

    // Usamos for...of para poder usar 'await' dentro
    for (const k of Object.keys(b)) {

      if (k === 'password') {
        // 1. ¡LÓGICA CORREGIDA! Si la clave es 'password', la hasheamos
        fields.push('password = ?');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(b[k], salt);
        params.push(hashedPassword);

      } else if (k === 'rol' && typeof b[k] === 'string') {
        // 2. Si es 'rol', la ponemos en minúscula
        fields.push('rol = ?');
        params.push(b[k].toLowerCase());

      } else if (k === 'es_estudiante_uta' || k === 'es_personal_uta') {
        fields.push(`${k} = ?`);
        params.push(!!b[k]); // Asegura que se guarde 0 o 1
      } else {
        // 3. Para todo lo demás (nombre, email, etc.)
        fields.push(`${k} = ?`);
        params.push(b[k]);
      }
    }

    params.push(cedula); // Añadir la cédula al final para el WHERE
    await pool.query(`UPDATE usuario SET ${fields.join(', ')} WHERE cedula = ?`, params);

    const [row] = await pool.query('SELECT cedula, nombre, apellido, email, rol, es_estudiante_uta, es_personal_uta, activo FROM usuario WHERE cedula = ?', [cedula]);
    res.json(sanitizeUser(row[0]));
  } catch (error) {
    console.error('Error en update:', error); // Mejor log de error
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

exports.getUserCourses = async (req, res) => {
  // La cédula se obtiene del token JWT, gracias al middleware 'auth'
  const cedula = req.user.cedula;

  try {
    // Query 1: Cursos donde el usuario está inscrito (Estudiante)
    const [enrolledCourses] = await pool.query(`
            SELECT 
                i.id_inscripcion,
                c.id_curso,
                c.nombre AS curso_nombre,
                c.activo,
                c.es_pagado,
                c.costo,
                i.estado,
                p.id_pago,
                p.aprobado AS pago_aprobado,
                p.metodo_pago,
                p.numero_orden,
                p.monto AS monto_pago,
                p.comprobante_pdf,
                'estudiante' AS rol,
                (
                  SELECT GROUP_CONCAT(tipo_documento SEPARATOR ',') 
                  FROM usuario_documento ud 
                  WHERE ud.cedula_usuario = i.cedula_usuario 
                    AND ud.id_curso = c.id_curso 
                    AND ud.estado = 'rechazado'
                ) as rejected_docs
            FROM inscripcion i
            JOIN curso c ON i.id_curso = c.id_curso
            LEFT JOIN pago p ON i.id_inscripcion = p.id_inscripcion
            WHERE i.cedula_usuario = ?
        `, [cedula]);

    // Query 2: Cursos donde el usuario es el responsable principal
    const [responsibleCourses] = await pool.query(`
            SELECT
                c.id_curso,
                c.nombre AS curso_nombre,
                c.activo,
                c.estado AS curso_estado,
                c.fecha_inicio,
                'responsable' AS rol
            FROM curso c
            WHERE c.cedula_responsable = ?
        `, [cedula]);
    // Query 3: Cursos donde el usuario es el docente principal 🆕
    const [docentePrincipalCourses] = await pool.query(`
          SELECT c.id_curso, c.nombre AS curso_nombre, c.activo, c.estado AS curso_estado, c.fecha_inicio, 'docente_principal' AS rol
          FROM curso c
          WHERE c.cedula_docente = ?
      `, [cedula]);

    // Query 4: Cursos donde el usuario es un encargado/co-instructor
    const [encargadoCourses] = await pool.query(`
            SELECT
                c.id_curso,
                c.nombre AS curso_nombre,
                c.activo,
                c.estado AS curso_estado,
                c.fecha_inicio,
                'encargado' AS rol
            FROM curso c
            JOIN curso_encargado ce ON c.id_curso = ce.id_curso
            WHERE ce.cedula_encargado = ?
        `, [cedula]);

    // Combinar todos los resultados y eliminar duplicados (priorizando el rol de estudiante)
    const combinedCourses = [...enrolledCourses, ...responsibleCourses, ...docentePrincipalCourses, ...encargadoCourses];
    const courseMap = new Map();
    combinedCourses.forEach(course => {
      const key = course.id_curso;
      // Si el curso ya existe, solo lo reemplaza si el nuevo rol es 'estudiante'
      if (course.rol === 'estudiante' || !courseMap.has(key)) {
        courseMap.set(key, course);
      }
    });

    res.json(Array.from(courseMap.values()));

  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({ error: 'Error al obtener los cursos del usuario' });
  }
};