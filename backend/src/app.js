// RUTA: backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { sequelize } from './models/index.js';
import authRoutes from './routes/auth.routes.js';
import { seedAdmin } from './seed/admin.seed.js'; // <-- NUEVO
import { seedCities } from './seed/cities.seed.js';
import quoteRoutes from './routes/quote.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api/quote', quoteRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'uvm-express' });
});

app.use('/api/auth', authRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); 
    console.log('MySQL conectado correctamente.');

    // Ejecuta semilla admin (idempotente)
    await seedAdmin(); // <-- NUEVO
    await seedCities();
  } catch (err) {
    console.error('Error al conectar MySQL:', err?.message || err);
  }
})();

export default app;
