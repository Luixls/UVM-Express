// RUTA: backend/src/models/Package.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Package', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    shipmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    pesoKg: { type: DataTypes.DECIMAL(8,2), allowNull: false },
    largoCm: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    anchoCm: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    altoCm: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    cantidad: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 }
  });
};
