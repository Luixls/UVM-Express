// RUTA: backend/src/routes/auth.routes.js
import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();

r.post('/register', [
  body('nombre').isString().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], register);

r.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], login);

r.get('/me', requireAuth, me);

export default r;
