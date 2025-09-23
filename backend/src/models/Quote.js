// RUTA: backend/src/models/Quote.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Quote', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    originCityId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    destCityId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    distanceKm: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    pesoCobradoKg: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
    precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    breakdown: { type: DataTypes.JSON, allowNull: true },
    expiresAt: { type: DataTypes.DATE, allowNull: true }
  });
};
