// RUTA: backend/src/routes/address.routes.js
import { Router } from 'express';
import { body } from 'express-validator';
import {
  listMyAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress
} from '../controllers/addressController.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();

r.get('/mine', requireAuth, listMyAddresses);

r.post(
  '/',
  [
    body('linea1').isString().isLength({ min: 4 }),
    body('ciudad').isString().isLength({ min: 2 }),
    body('pais').isString().isLength({ min: 2 }),
    body('isDefault').optional().isBoolean()
  ],
  requireAuth,
  createAddress
);

r.put('/:id', requireAuth, updateAddress);
r.post('/:id/default', requireAuth, setDefaultAddress);
r.delete('/:id', requireAuth, deleteAddress);

export default r;
