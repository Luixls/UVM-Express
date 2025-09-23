// RUTA: backend/src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, error: 'No autenticado' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.uid);
    if (!user || !user.activo) return res.status(401).json({ ok: false, error: 'Usuario inválido o inactivo' });

    req.user = { id: user.id, rol: user.rol, nombre: user.nombre, email: user.email };
    next();
  } catch (e) {
    next({ status: 401, message: 'Token inválido o expirado' });
  }
};
