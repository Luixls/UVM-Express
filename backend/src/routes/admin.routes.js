// RUTA: backend/src/routes/admin.routes.js
import { Router } from 'express';
import { body } from 'express-validator';
import { updateStatus } from '../controllers/adminController.js';
import { adminListShipments } from '../controllers/shipmentListController.js';
import { exportShipmentsCsv } from '../controllers/exportController.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/roles.js';

const r = Router();

r.get('/shipments', requireAuth, requireAdmin, adminListShipments);
r.get('/shipments/export.csv', requireAuth, requireAdmin, exportShipmentsCsv);

r.post(
  '/shipments/:tracking/status',
  [ body('status').isString().isLength({ min: 3 }) ],
  requireAuth,
  requireAdmin,
  updateStatus
);

export default r;
