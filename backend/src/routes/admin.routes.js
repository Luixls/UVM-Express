// RUTA: backend/src/routes/admin.routes.js
import { Router } from 'express';
import { body } from 'express-validator';
import { updateStatus } from '../controllers/adminController.js';
import { adminListShipments } from '../controllers/shipmentListController.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/roles.js';

const r = Router();

// Listado admin con filtros (?q, ?status, ?userId, ?limit, ?offset)
r.get('/shipments', requireAuth, requireAdmin, adminListShipments);

// Actualizar estado
r.post(
  '/shipments/:tracking/status',
  [ body('status').isString().isLength({ min: 3 }) ],
  requireAuth,
  requireAdmin,
  updateStatus
);

export default r;
