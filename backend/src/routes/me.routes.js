// RUTA: backend/src/routes/me.routes.js
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { requireAuth } from '../middlewares/auth.js'
import { User, Shipment, Package } from '../models/index.js'

const router = Router()

// Helper: status legible (igual al usado en frontend)
const STATUS_ES = {
  ORDER_CREATED: 'Orden creada',
  IN_POSSESSION: 'En posesión',
  IN_TRANSIT: 'En tránsito',
  DELIVERED: 'Entregado',
  EX_DELAY_WEATHER: 'Retraso por clima',
  EX_MISSED_SCAN_24H: '24h sin escaneo',
  EX_LOST: 'Extravío',
  EX_CANCELLED_RETURN: 'Cancelado/retorno',
  EX_BAD_ADDRESS_RETRY: 'Dirección errónea',
  EX_UNDELIVERABLE_3X: 'No entregado (3x)',
}

// GET /api/me  → datos del usuario autenticado
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const u = await User.findByPk(req.user.id)
    if (!u) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' })

    // Solo campos existentes en tu modelo actual
    const user = {
      id: u.id,
      username: u.username ?? null, // si no existe, quedará null
      email: u.email,
      rol: u.rol,
      nombre: u.nombre || '',
      telefono: u.telefono || '',
      activo: !!u.activo,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }
    res.json({ ok: true, user })
  } catch (e) { next(e) }
})

// PUT /api/me  → actualizar perfil (solo campos que EXISTEN en el modelo User)
router.put('/', requireAuth, async (req, res, next) => {
  try {
    const patch = {}

    if ('nombre' in req.body) patch.nombre = String(req.body.nombre ?? '').trim()
    if ('telefono' in req.body) patch.telefono = String(req.body.telefono ?? '').trim()
    // Si quieres permitir cambiar email, descomenta validación (recuerda unique):
    // if ('email' in req.body) patch.email = String(req.body.email ?? '').trim()

    await User.update(patch, { where:{ id:req.user.id } })

    const u = await User.findByPk(req.user.id)
    const user = {
      id: u.id,
      username: u.username ?? null,
      email: u.email,
      rol: u.rol,
      nombre: u.nombre || '',
      telefono: u.telefono || '',
      activo: !!u.activo,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }
    res.json({ ok:true, user })
  } catch (e) { next(e) }
})

// PUT /api/me/password  → cambiar contraseña
router.put('/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {}
    if (!currentPassword || !newPassword)
      return res.status(400).json({ ok:false, error:'Datos incompletos' })

    const u = await User.findByPk(req.user.id)
    if (!u) return res.status(404).json({ ok:false, error:'Usuario no encontrado' })

    const ok = await bcrypt.compare(currentPassword, u.passwordHash)
    if (!ok) return res.status(400).json({ ok:false, error:'Credenciales inválidas' })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)
    await User.update({ passwordHash }, { where:{ id: u.id } })

    res.json({ ok:true, message:'Contraseña actualizada' })
  } catch (e) { next(e) }
})

// GET /api/me/shipments  → envíos del usuario (con labels descargables)
router.get('/shipments', requireAuth, async (req, res, next) => {
  try {
    const rows = await Shipment.findAll({
      where: { userId: req.user.id },
      order: [['createdAt','DESC']],
      attributes: ['id','tracking','masterTracking','status','createdAt','etaDate']
    })

    // Trae paquetes de cada envío para construir URLs de etiquetas
    const shipments = []
    for (const sh of rows) {
      const pkgs = await Package.findAll({
        where: { shipmentId: sh.id },
        attributes: ['id','tracking','status']
      })

      // Cada etiqueta se asume como /labels/<tracking>.pdf (una por paquete)
      const labels = pkgs.map(p => ({
        tracking: p.tracking,
        url: `${process.env.BASE_URL?.replace(/\/+$/,'') || ''}/labels/${encodeURIComponent(p.tracking)}.pdf`
      }))

      shipments.push({
        id: String(sh.id),
        tracking: sh.tracking,
        masterTracking: sh.masterTracking || null,
        status: sh.status,
        statusText: STATUS_ES[sh.status] || sh.status, // legible
        etaDate: sh.etaDate,
        createdAt: sh.createdAt,
        packageCount: pkgs.length,
        labels
      })
    }

    res.json({ ok:true, shipments })
  } catch (e) { next(e) }
})

export default router
