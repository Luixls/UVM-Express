// RUTA: backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './models/index.js';

// Rutas
import authRoutes from './routes/auth.routes.js';
import quoteRoutes from './routes/quote.routes.js';
import shipmentRoutes from './routes/shipment.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import adminRoutes from './routes/admin.routes.js';
import cityRoutes from './routes/city.routes.js';
import statusRoutes from './routes/status.routes.js';
import addressRoutes from './routes/address.routes.js';
import meRoutes from './routes/me.routes.js';

// Seeds (solo se ejecutan si SEED_ON_BOOT === 'true')
import { seedAdmin } from './seed/admin.seed.js';
import { seedCities } from './seed/cities.seed.js';
import { seedStatusCatalog } from './seed/statusCatalog.seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Carpeta estática de etiquetas PDF
app.use('/labels', express.static(path.join(process.cwd(), process.env.LABELS_DIR || 'labels')));

// Healthcheck
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'uvm-express' }));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/status-catalog', statusRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/me', meRoutes);

// ⬇ IIFE de arranque (sin force)
;(async () => {
  try {
    await sequelize.authenticate();

    // Desarrollo: ajusta esquema sin borrar datos.
    await sequelize.sync({ alter: true });
    // Producción: cuando todo esté estable, usa simplemente:
    // await sequelize.sync();

    console.log('MySQL conectado correctamente.');

    if (process.env.SEED_ON_BOOT === 'true') {
      console.log('[app] SEED_ON_BOOT=true → ejecutando semillas…');
      try {
        await seedStatusCatalog(); // idempotente
        await seedCities();        // idempotente
        await seedAdmin();         // idempotente
        console.log('[app] Semillas completadas.');
      } catch (se) {
        console.warn('[app] Advertencia durante semillas:', se?.message || se);
      }
    } else {
      console.log('[app] SEED_ON_BOOT=false → omitiendo semillas al iniciar');
    }
  } catch (err) {
    console.error('Error al conectar MySQL:', err?.message || err);
  }
})();

// Middleware de error
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  console.error('[ERROR]', message, err?.stack || '');
  res.status(status).json({ ok: false, error: message });
});

export default app;
