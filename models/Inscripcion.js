const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inscripcion = sequelize.define('Inscripcion', {
  id_inscripcion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cedula_usuario: { type: DataTypes.STRING },
  id_curso: { type: DataTypes.INTEGER },
  nota_final: { type: DataTypes.DECIMAL(5,2) },
  asistencia: { type: DataTypes.DECIMAL(5,2) },
  estado: { type: DataTypes.ENUM('pendiente','pagado','aprobado','reprobado'), defaultValue: 'pendiente' }
  // ...otros campos
}, {
  tableName: 'inscripcion',
  timestamps: false
});

module.exports = Inscripcion;