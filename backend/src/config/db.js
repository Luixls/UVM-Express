// RUTA: backend/src/config/db.js
import dotenv from 'dotenv';
dotenv.config(); // <-- Asegura que .env esté cargado ANTES de leer process.env aquí

import { Sequelize } from 'sequelize';

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASS
} = process.env;

if (!DB_HOST || !DB_NAME || DB_USER === undefined || DB_PASS === undefined) {
  console.warn('[db] Variables de entorno incompletas. Revisa backend/.env');
}

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: DB_HOST || 'localhost',
  port: Number(DB_PORT || 3306),
  database: DB_NAME || 'uvm_express',
  username: DB_USER ?? '',
  password: DB_PASS ?? '',
  logging: false,
  define: { underscored: false, freezeTableName: true }
});
