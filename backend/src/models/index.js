// RUTA: backend/src/models/index.js
import { sequelize } from '../config/db.js';
import UserModel from './User.js';

const User = UserModel(sequelize);

// Aquí más adelante añadiremos y relacionaremos otros modelos
export { sequelize, User };
