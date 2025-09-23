// RUTA: backend/src/routes/shipment.routes.js
import { Router } from 'express';
import { body } from 'express-validator';
import { createShipment } from '../controllers/shipmentController.js';
import { listMyShipments } from '../controllers/shipmentListController.js';
import { listPayments, createPayment } from '../controllers/paymentController.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();

// Crear envío (ya existente)
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

// Listado del usuario (ya existente)
r.get('/mine', requireAuth, listMyShipments);

// Pagos del envío (ver)
r.get('/:tracking/payments', requireAuth, listPayments);

// Crear pago/abono
r.post(
  '/:tracking/payments',
  [ body('amount').isFloat({ gt: 0 }) ],
  requireAuth,
  createPayment
);

export default r;
