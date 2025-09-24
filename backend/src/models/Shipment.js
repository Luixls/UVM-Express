// RUTA: backend/src/models/Shipment.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Shipment', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    tracking: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    senderAddressId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    recipientName: { type: DataTypes.STRING(100), allowNull: false },
    recipientAddress: { type: DataTypes.STRING(300), allowNull: false },
    masterTracking: { type: DataTypes.STRING(32), allowNull: true, unique: true },
    status: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'ORDER_CREATED' },
    serviceType: { type: DataTypes.ENUM('standard', 'express'), defaultValue: 'standard' },

    // ETA “actual” para mostrar en UI sin recalcular
    etaDate: { type: DataTypes.DATE, allowNull: true },

    // Entrega final
    deliveredAt: { type: DataTypes.DATE, allowNull: true },
    deliveredSignature: { type: DataTypes.STRING(100), allowNull: true },

    // Pagos
    paymentStatus: { type: DataTypes.ENUM('pendiente', 'abonado', 'pagado'), defaultValue: 'pendiente' },
    declaredValueTotal: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    amountTotal: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    amountPaid: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }
  });
};
