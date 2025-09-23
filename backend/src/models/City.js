// RUTA: backend/src/models/City.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('City', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    pais: { type: DataTypes.STRING(60), allowNull: false },
    estado: { type: DataTypes.STRING(60) },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    lat: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
    lon: { type: DataTypes.DECIMAL(10, 7), allowNull: false }
  });
};
