// RUTA: backend/src/models/index.js
import { sequelize } from '../config/db.js';
import UserModel from './User.js';
import CityModel from './City.js';
import QuoteModel from './Quote.js';

const User = UserModel(sequelize);
const City = CityModel(sequelize);
const Quote = QuoteModel(sequelize);

// Relaciones
City.hasMany(Quote, { foreignKey: 'originCityId', as: 'quotesFrom' });
City.hasMany(Quote, { foreignKey: 'destCityId', as: 'quotesTo' });
Quote.belongsTo(City, { foreignKey: 'originCityId', as: 'origin' });
Quote.belongsTo(City, { foreignKey: 'destCityId', as: 'dest' });

export { sequelize, User, City, Quote };
