// RUTA: backend/src/routes/status.routes.js
import { Router } from 'express';
import { getStatusCatalog } from '../controllers/statusController.js';

const r = Router();
// Público: útil para selects de frontend/admin
r.get('/', getStatusCatalog);

export default r;
