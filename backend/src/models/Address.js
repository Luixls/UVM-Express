// RUTA: backend/src/models/Address.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Address', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    alias: { type: DataTypes.STRING(60) },
    linea1: { type: DataTypes.STRING(150), allowNull: false },
    linea2: { type: DataTypes.STRING(150) },
    ciudad: { type: DataTypes.STRING(100), allowNull: false },
    estado: { type: DataTypes.STRING(100) },
    pais: { type: DataTypes.STRING(100), allowNull: false },
    postal: { type: DataTypes.STRING(20) },
    lat: { type: DataTypes.DECIMAL(10, 7) },
    lon: { type: DataTypes.DECIMAL(10, 7) },

    // NUEVO: dirección predeterminada del usuario
    isDefault: { type: DataTypes.BOOLEAN, defaultValue: false }
  });
};
