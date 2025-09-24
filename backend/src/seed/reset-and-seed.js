// RUTA: backend/src/seed/reset-and-seed.js
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar .env de forma explícita y visible
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(process.cwd(), '.env'); // ejecutas desde /backend
const envOK = dotenv.config({ path: envPath });
console.log(`[seed] .env cargado desde: ${envPath} (ok=${!envOK.error})`);

import { sequelize } from '../models/index.js';
import { seedAdmin } from './admin.seed.js';
import { seedCities } from './cities.seed.js';
import { seedStatusCatalog } from './statusCatalog.seed.js';
import { seedDemoUsersAndAddresses } from './demoUsers.seed.js';
import { seedDemoShipments } from './demoShipments.seed.js';

function assertEnv() {
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS } = process.env;
  console.log('[seed] DB_HOST=%s DB_PORT=%s DB_NAME=%s DB_USER=%s (pass=%s)',
    DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS ? 'sí' : 'no');

  const missing = [];
  if (!DB_HOST) missing.push('DB_HOST');
  if (!DB_NAME) missing.push('DB_NAME');
  if (!DB_USER) missing.push('DB_USER');
  // DB_PASS podría ser vacío si usas auth sin password, pero normalmente NO:
  if (DB_PASS === undefined) missing.push('DB_PASS');

  if (missing.length) {
    throw new Error(`[seed] Faltan variables en .env: ${missing.join(', ')} — edita backend/.env`);
  }
}

async function wipeAll() {
  // IMPORTANTE: nombres exactos (freezeTableName=true)
  const tables = [
    'TrackingEvent',
    'Package',
    'Payment',
    'Shipment',
    'Quote',
    'Address',
    'User',
    'City',
    'StatusCatalog'
  ];

  console.log('→ Borrando todas las tablas…');
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
  for (const t of tables) {
    try {
      await sequelize.query(`TRUNCATE TABLE \`${t}\`;`);
      console.log(`   • ${t} → OK`);
    } catch (e) {
      console.warn(`   • ${t} → (posible inexistente)`, e?.message || e);
    }
  }
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
}

(async () => {
  try {
    assertEnv();

    console.log('Conectando MySQL…');
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados.');

    await wipeAll();

    console.log('Sembrando datos base…');
    await seedStatusCatalog();
    await seedCities();
    await seedAdmin();

    console.log('Sembrando datos de demo (usuarios/direcciones)…');
    const demo = await seedDemoUsersAndAddresses();

    console.log('Sembrando envíos de demo…');
    await seedDemoShipments(demo);

    console.log('✅ SEED COMPLETADO.');
    process.exit(0);
  } catch (e) {
    console.error('❌ SEED FALLÓ:', e);
    process.exit(1);
  }
})();
