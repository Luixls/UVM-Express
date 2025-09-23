// RUTA: backend/src/models/Payment.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    shipmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    method: { type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia'), defaultValue: 'efectivo' },
    amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    status: { type: DataTypes.ENUM('pendiente', 'completado', 'fallido'), defaultValue: 'completado' },
    transactionRef: { type: DataTypes.STRING(80) }
  });
};
