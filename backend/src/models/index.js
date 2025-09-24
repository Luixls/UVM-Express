// RUTA: backend/src/models/index.js
import { sequelize } from '../config/db.js';

// MODELOS
import UserModel from './User.js';
import AddressModel from './Address.js';
import CityModel from './City.js';
import QuoteModel from './Quote.js';
import ShipmentModel from './Shipment.js';
import PackageModel from './Package.js';
import TrackingEventModel from './TrackingEvent.js';
import PaymentModel from './Payment.js';
import StatusCatalogModel from './StatusCatalog.js';

// INSTANCIAS
const User = UserModel(sequelize);
const Address = AddressModel(sequelize);
const City = CityModel(sequelize);
const Quote = QuoteModel(sequelize);
const Shipment = ShipmentModel(sequelize);
const Package = PackageModel(sequelize);
const TrackingEvent = TrackingEventModel(sequelize);
const Payment = PaymentModel(sequelize);
const StatusCatalog = StatusCatalogModel(sequelize);

// RELACIONES

// Users ⇄ Addresses
User.hasMany(Address, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });

// Cities ⇄ Quotes (origen/destino)
City.hasMany(Quote, { foreignKey: 'originCityId', as: 'quotesFrom' });
City.hasMany(Quote, { foreignKey: 'destCityId', as: 'quotesTo' });
Quote.belongsTo(City, { foreignKey: 'originCityId', as: 'origin' });
Quote.belongsTo(City, { foreignKey: 'destCityId', as: 'dest' });

// Users ⇄ Shipments
User.hasMany(Shipment, { foreignKey: 'userId' });
Shipment.belongsTo(User, { foreignKey: 'userId' });

// (Opcional) SenderAddressId en Shipment si lo usas en el modelo
// Address.hasMany(Shipment, { foreignKey: 'senderAddressId' });
// Shipment.belongsTo(Address, { foreignKey: 'senderAddressId', as: 'senderAddress' });

// Shipments ⇄ Packages
Shipment.hasMany(Package, { foreignKey: 'shipmentId' });
Package.belongsTo(Shipment, { foreignKey: 'shipmentId' });

// Shipments ⇄ TrackingEvents (eventos “generales” sin packageId)
Shipment.hasMany(TrackingEvent, { foreignKey: 'shipmentId' });
TrackingEvent.belongsTo(Shipment, { foreignKey: 'shipmentId' });

// Packages ⇄ TrackingEvents (eventos por paquete)
Package.hasMany(TrackingEvent, { foreignKey: 'packageId' });
TrackingEvent.belongsTo(Package, { foreignKey: 'packageId' });

// Shipments ⇄ Payments
Shipment.hasMany(Payment, { foreignKey: 'shipmentId' });
Payment.belongsTo(Shipment, { foreignKey: 'shipmentId' });

// EXPORTS
export {
  sequelize,
  User,
  Address,
  City,
  Quote,
  Shipment,
  Package,
  TrackingEvent,
  Payment,
  StatusCatalog
};
