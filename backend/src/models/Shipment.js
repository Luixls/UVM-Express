// RUTA: backend/src/models/Shipment.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Shipment', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    tracking: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    senderAddressId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }, // opcional por ahora
    recipientName: { type: DataTypes.STRING(100), allowNull: false },
    recipientAddress: { type: DataTypes.STRING(300), allowNull: false },
    status: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'ORDER_CREATED' },
    serviceType: { type: DataTypes.ENUM('standard', 'express'), defaultValue: 'standard' },
    paymentStatus: { type: DataTypes.ENUM('pendiente', 'abonado', 'pagado'), defaultValue: 'pendiente' },
    declaredValueTotal: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    amountTotal: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    amountPaid: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }
  });
};
