// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos subidos desde src/uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/cursos', require('./routes/cursos.routes'));
app.use('/api/cursos', require('./routes/encargados.routes'));
const inscripcionRoutes = require('./routes/inscripcion.routes');
app.use('/api/inscripciones', inscripcionRoutes);
const usuariosRoutes = require('./routes/usuarios.routes');
app.use('/api/usuarios', usuariosRoutes);
const solicitudesRoutes = require('./routes/solicitudes.routes');
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/pagos', require('./routes/pagos.routes'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('API escuchando en puerto ' + port));
