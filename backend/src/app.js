// RUTA: backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './models/index.js';
import authRoutes from './routes/auth.routes.js';
import quoteRoutes from './routes/quote.routes.js';
import shipmentRoutes from './routes/shipment.routes.js';
import { seedAdmin } from './seed/admin.seed.js';
import { seedCities } from './seed/cities.seed.js';
import { seedStatusCatalog } from './seed/statusCatalog.seed.js';
import trackingRoutes from './routes/tracking.routes.js';
import adminRoutes from './routes/admin.routes.js';
import cityRoutes from './routes/city.routes.js';
import statusRoutes from './routes/status.routes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Carpeta estática de etiquetas PDF
app.use('/labels', express.static(path.join(process.cwd(), process.env.LABELS_DIR || 'labels')));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'uvm-express' }));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/status-catalog', statusRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('MySQL conectado correctamente.');

    await seedAdmin();
    await seedCities();
    await seedStatusCatalog(); // <-- NUEVO
  } catch (err) {
    console.error('Error al conectar MySQL:', err?.message || err);
  }
})();

export default app;
