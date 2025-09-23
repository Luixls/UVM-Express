// RUTA: backend/src/routes/city.routes.js
import { Router } from 'express';
import { listCities, getCityById } from '../controllers/cityController.js';

const r = Router();

// Público: sirve para selects del frontend
r.get('/', listCities);
r.get('/:id', getCityById);

export default r;
