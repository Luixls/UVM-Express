// RUTA: backend/src/routes/quote.routes.js
import { Router } from 'express';
import { body } from 'express-validator';
import { createQuote, quoteMulti } from '../controllers/quoteController.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();

/**
 * Nota: Por requisitos, solo usuarios logueados pueden cotizar.
 * Si quisieras permitir a Guest, eliminar `requireAuth` y manejar userId null.
 */

// Cotización "simple" (un paquete)
r.post(
  '/',
  [
    body('originCityId').isInt({ min: 1 }),
    body('destCityId').isInt({ min: 1 }),
    body('pesoKg').isFloat({ min: 0.01 }),
    body('largoCm').isInt({ min: 1 }),
    body('anchoCm').isInt({ min: 1 }),
    body('altoCm').isInt({ min: 1 }),
    body('cantidad').optional().isInt({ min: 1 })
  ],
  requireAuth,
  createQuote
);

// Cotización "multi" (varios paquetes)
r.post(
  '/multi',
  [
    body('originCityId').isInt({ min: 1 }),
    body('destCityId').isInt({ min: 1 }),
    body('packages').isArray({ min: 1 }),

    body('packages.*.pesoKg').isFloat({ min: 0.01 }),
    body('packages.*.largoCm').isInt({ min: 1 }),
    body('packages.*.anchoCm').isInt({ min: 1 }),
    body('packages.*.altoCm').isInt({ min: 1 }),
    body('packages.*.cantidad').optional().isInt({ min: 1 }),
    body('packages.*.declaredValue').optional().isFloat({ min: 0 })
  ],
  requireAuth,
  quoteMulti
);

export default r;
