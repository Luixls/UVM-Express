// RUTA: backend/src/routes/admin.routes.js
import { Router } from 'express';
import { body } from 'express-validator';
import { updateStatus } from '../controllers/adminController.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/roles.js';

const r = Router();

r.post(
  '/shipments/:tracking/status',
  [ body('status').isString().isLength({ min: 3 }) ],
  requireAuth,
  requireAdmin,
  updateStatus
);

export default r;
