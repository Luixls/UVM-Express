// RUTA: backend/src/routes/quote.routes.js
import { Router } from 'express';
import { body } from 'express-validator';
import { createQuote } from '../controllers/quoteController.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();

/**
 * Nota: Por requisitos, solo usuarios logueados pueden cotizar.
 * Si quisieras permitir a Guest, elimina `requireAuth` y maneja userId null.
 */
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

export default r;
