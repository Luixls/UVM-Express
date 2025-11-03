// RUTA: backend/src/models/Package.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Package = sequelize.define('Package', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

    shipmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },

    // tracking individual del paquete
    tracking: { type: DataTypes.STRING(32), allowNull: false, unique: true },

    // estado propio del paquete
    status: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'ORDER_CREATED' },

    pesoKg:  { type: DataTypes.DECIMAL(8,2), allowNull: false },
    largoCm: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    anchoCm: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    altoCm:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    cantidad: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 }
  }, {
    tableName: 'Package',
    timestamps: true,

    // 🔒 Índices con nombre estable
    indexes: [
      { name: 'pk_tracking_uq', unique: true, fields: ['tracking'] },
      { name: 'pk_shipment',    fields: ['shipmentId'] },
      { name: 'pk_status',      fields: ['status'] },
    ],
  });

  return Package;
};
