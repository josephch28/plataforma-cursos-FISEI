// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/cursos', require('./routes/cursos.routes'));
app.use('/api/cursos', require('./routes/encargados.routes'));
const inscripcionRoutes = require('./routes/inscripcion.routes');
app.use('/api/inscripciones', inscripcionRoutes);
const usuariosRoutes = require('./routes/usuarios.routes');
app.use('/api/usuarios', usuariosRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('API escuchando en puerto ' + port));
