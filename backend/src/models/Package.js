// RUTA: backend/src/models/Package.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Package', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    shipmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },

    // NUEVO: tracking individual del paquete
    tracking: { type: DataTypes.STRING(32), allowNull: false, unique: true },

    // NUEVO: estado propio del paquete (default “ORDER_CREATED”, igual catálogo)
    status: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'ORDER_CREATED' },

    pesoKg: { type: DataTypes.DECIMAL(8,2), allowNull: false },
    largoCm: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    anchoCm: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    altoCm: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    cantidad: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 }
  });
};
