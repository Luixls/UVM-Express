// RUTA: backend/src/models/index.js
import { sequelize } from '../config/db.js';
import UserModel from './User.js';
import CityModel from './City.js';
import QuoteModel from './Quote.js';
import ShipmentModel from './Shipment.js';
import PackageModel from './Package.js';
import TrackingEventModel from './TrackingEvent.js';
import PaymentModel from './Payment.js';
import StatusCatalogModel from './StatusCatalog.js';

const User = UserModel(sequelize);
const City = CityModel(sequelize);
const Quote = QuoteModel(sequelize);
const Shipment = ShipmentModel(sequelize);
const Package = PackageModel(sequelize);
const TrackingEvent = TrackingEventModel(sequelize);
const Payment = PaymentModel(sequelize);
const StatusCatalog = StatusCatalogModel(sequelize);

// Relaciones (igual que ya tenías)
City.hasMany(Quote, { foreignKey: 'originCityId', as: 'quotesFrom' });
City.hasMany(Quote, { foreignKey: 'destCityId', as: 'quotesTo' });
Quote.belongsTo(City, { foreignKey: 'originCityId', as: 'origin' });
Quote.belongsTo(City, { foreignKey: 'destCityId', as: 'dest' });

User.hasMany(Shipment, { foreignKey: 'userId' });
Shipment.belongsTo(User, { foreignKey: 'userId' });

Shipment.hasMany(Package, { foreignKey: 'shipmentId' });
Package.belongsTo(Shipment, { foreignKey: 'shipmentId' });

Shipment.hasMany(TrackingEvent, { foreignKey: 'shipmentId' });
TrackingEvent.belongsTo(Shipment, { foreignKey: 'shipmentId' });

Shipment.hasMany(Payment, { foreignKey: 'shipmentId' });
Payment.belongsTo(Shipment, { foreignKey: 'shipmentId' });

export { sequelize, User, City, Quote, Shipment, Package, TrackingEvent, Payment, StatusCatalog };
