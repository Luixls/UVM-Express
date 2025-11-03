// RUTA: backend/src/middlewares/roles.js
import { requireAuth } from './auth.js'

export const requireAdmin = [
  requireAuth,
  (req, res, next) => {
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({ ok:false, error:'No autorizado (solo administradores)' })
    }
    next()
  }
]
