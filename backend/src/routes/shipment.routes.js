// RUTA: backend/src/routes/shipment.routes.js
import { Router } from 'express';
import { body } from 'express-validator';
import { createShipment } from '../controllers/shipmentController.js';
import { listMyShipments } from '../controllers/shipmentListController.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();

// Crear envío
r.post(
  '/',
  [
    body('quoteId').isInt({ min: 1 }),
    body('recipientName').isString().isLength({ min: 2 }),
    body('recipientAddress').isString().isLength({ min: 5 }),
    body('packages').isArray({ min: 1 })
  ],
  requireAuth,
  createShipment
);

// Listar envíos del usuario autenticado
// Query opcionales: ?q=texto&status=IN_TRANSIT&limit=20&offset=0
r.get('/mine', requireAuth, listMyShipments);

export default r;
