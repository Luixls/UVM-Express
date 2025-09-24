// RUTA: backend/src/seed/admin.seed.js
import { User } from '../models/index.js';

/**
 * Crea/asegura un usuario admin (idempotente) usando variables de entorno.
 * Logs:
 *  - warn si faltan variables
 *  - log si ya existe
 *  - log si se crea o si se actualiza el rol a admin
 */
export const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const nombre = process.env.ADMIN_NOMBRE || 'Administrador';
  const password = process.env.ADMIN_PASSWORD;
  const telefono = process.env.ADMIN_TELEFONO || '';

  if (!email || !password) {
    console.warn('[seedAdmin] Variables ADMIN_EMAIL y ADMIN_PASSWORD no definidas. Semilla omitida.');
    return;
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) {
    if (exists.rol !== 'admin') {
      exists.rol = 'admin';
      await exists.save();
      console.log(`[seedAdmin] Usuario existente actualizado a admin: ${email}`);
    } else {
      console.log(`[seedAdmin] Admin ya existe: ${email}`);
    }
    return;
  }

  const admin = await User.create({
    rol: 'admin',
    nombre,
    email,
    telefono,
    passwordHash: 'temp'
  });
  await admin.setPassword(password);
  await admin.save();

  console.log(`[seedAdmin] Admin creado: ${email}`);
};
