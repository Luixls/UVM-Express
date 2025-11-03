// RUTA: backend/src/models/TrackingEvent.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const TrackingEvent = sequelize.define('TrackingEvent', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

    // claves de relación
    shipmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    packageId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },

    // datos del evento
    status:    { type: DataTypes.STRING(40), allowNull: false },
    note:      { type: DataTypes.STRING(400) },
    location:  { type: DataTypes.STRING(120) },
    etaDate:   { type: DataTypes.DATE },                  // para mostrar ETA como evento futuro
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    actorUserId: { type: DataTypes.INTEGER.UNSIGNED }
  }, {
    tableName: 'TrackingEvent',
    timestamps: true,

    // 🔒 Índices NOMBRADOS para evitar duplicados con alter:true
    indexes: [
      // consultas más comunes: eventos por envío en orden temporal
      { name: 'te_shipment_ts', fields: ['shipmentId', 'timestamp'] },
      // timeline de un paquete concreto
      { name: 'te_package_ts', fields: ['packageId', 'timestamp'] },
      // listados/alertas por estado
      { name: 'te_status_ts',  fields: ['status', 'timestamp'] },
      // auditoría por actor si lo usas
      { name: 'te_actor_ts',   fields: ['actorUserId', 'timestamp'] },
    ],
  });

  return TrackingEvent;
};
