// RUTA: backend/src/models/Shipment.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Shipment = sequelize.define('Shipment', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

    tracking:       { type: DataTypes.STRING(32), allowNull: false, unique: true },
    masterTracking: { type: DataTypes.STRING(32), allowNull: true, unique: true },

    userId:          { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    senderAddressId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },

    recipientName:    { type: DataTypes.STRING(100), allowNull: false },
    recipientAddress: { type: DataTypes.STRING(300), allowNull: false },

    status: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'ORDER_CREATED' },
    serviceType: { type: DataTypes.ENUM('standard', 'express'), defaultValue: 'standard' },

    etaDate: { type: DataTypes.DATE, allowNull: true },

    deliveredAt:        { type: DataTypes.DATE, allowNull: true },
    deliveredSignature: { type: DataTypes.STRING(100), allowNull: true },

    paymentStatus:      { type: DataTypes.ENUM('pendiente', 'abonado', 'pagado'), defaultValue: 'pendiente' },
    declaredValueTotal: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    amountTotal:        { type: DataTypes.DECIMAL(10,2), allowNull: false },
    amountPaid:         { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }
  }, {
    tableName: 'Shipment',
    timestamps: true,

    // 🔒 Índices con nombre estable
    indexes: [
      { name: 'sh_tracking_uq',       unique: true, fields: ['tracking'] },
      { name: 'sh_master_tracking_uq', unique: true, fields: ['masterTracking'] },
      { name: 'sh_user_created',      fields: ['userId', 'createdAt'] },
      { name: 'sh_status_created',    fields: ['status', 'createdAt'] },
    ],
  });

  return Shipment;
};
