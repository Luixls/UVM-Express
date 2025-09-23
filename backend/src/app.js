// RUTA: backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { sequelize } from './models/index.js';
import authRoutes from './routes/auth.routes.js'; // <— agrega esta línea

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'uvm-express' });
});

// Monta rutas
app.use('/api/auth', authRoutes); // <— agrega esta línea

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); 
    console.log('MySQL conectado correctamente.');
  } catch (err) {
    console.error('Error al conectar MySQL:', err?.message || err);
  }
})();

export default app;
