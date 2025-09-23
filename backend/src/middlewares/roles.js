// RUTA: backend/src/middlewares/roles.js
export const requireAdmin = (req, res, next) => {
  if (req.user?.rol !== 'admin') return res.status(403).json({ ok: false, error: 'Solo admins' });
  next();
};
