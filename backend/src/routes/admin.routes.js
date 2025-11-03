// RUTA: backend/src/routes/admin.routes.js
import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';
import {
  // EXISTENTES
  getShipmentPackages,
  createAdminEventOrStatus,
  downloadShipmentLabelsZip,
  // NUEVOS
  listUsers,
  updateUser,
  listPackages
} from '../controllers/adminController.js';

const r = Router();

/** ====== Usuarios ====== */
r.get(
  '/users',
  requireAuth, requireAdmin,
  [
    query('q').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 200 })
  ],
  listUsers
);

r.put(
  '/users/:id',
  requireAuth, requireAdmin,
  [
    param('id').isInt({ min: 1 }),
    body('nombre').optional().isString().isLength({ min: 2 }),
    body('email').optional().isEmail(),
    body('rol').optional().isIn(['usuario', 'admin']),
    body('activo').optional().isBoolean()
  ],
  updateUser
);

/** ====== Paquetes ====== */
r.get(
  '/packages',
  requireAuth, requireAdmin,
  [
    query('q').optional().isString(),
    query('status').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 200 })
  ],
  listPackages
);

/** ====== Gestión por tracking (existente) ====== */
// Listar paquetes por tracking maestro / envío
r.get('/shipments/:tracking/packages', requireAuth, requireAdmin, getShipmentPackages);

// Crear evento/estatus (fecha + hora, paquete específico o todos)
r.post(
  '/events',
  requireAuth, requireAdmin,
  [
    body('shipmentTracking').isString().isLength({ min: 6 }),
    body('status').isString().isLength({ min: 2 }),
    body('note').optional().isString(),
    body('location').optional().isString(),
    body('date').isString(),
    body('time').optional().isString(),
    body('packageTracking').optional().isString(),
    body('applyToAll').optional().isBoolean()
  ],
  createAdminEventOrStatus
);

// Descargar etiquetas ZIP
r.get('/shipments/:tracking/labels.zip', requireAuth, requireAdmin, downloadShipmentLabelsZip);

export default r;
