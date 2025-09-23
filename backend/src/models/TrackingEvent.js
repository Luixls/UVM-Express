// RUTA: backend/src/models/TrackingEvent.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('TrackingEvent', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    shipmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: { type: DataTypes.STRING(40), allowNull: false },
    note: { type: DataTypes.STRING(400) },
    location: { type: DataTypes.STRING(120) },
    etaDate: { type: DataTypes.DATE },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    actorUserId: { type: DataTypes.INTEGER.UNSIGNED }
  });
};
