// RUTA: backend/src/controllers/adminController.js
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { Op } from 'sequelize';
import { validationResult } from 'express-validator';
import { Shipment, Package, TrackingEvent, User } from '../models/index.js';

/* Util: compone timestamp desde date (YYYY-MM-DD) + time (HH:mm) */
function composeTimestamp(date, time) {
  const t = (time && /^\d{2}:\d{2}$/.test(time)) ? time : '00:00';
  const iso = new Date(`${date}T${t}:00`);
  return Number.isNaN(iso.getTime()) ? new Date() : iso;
}

/** ==================== USUARIOS ==================== */
// GET /api/admin/users?q=&page=1&limit=20
export const listUsers = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);   // por defecto 50
    const offset = (page - 1) * limit;

    const where = q ? {
      [Op.or]: [
        { nombre: { [Op.like]: `%${q}%` } },
        { email:  { [Op.like]: `%${q}%` } }
      ]
    } : {};

    const { rows, count } = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: ['id','nombre','email','rol','activo','createdAt']
    });

    res.json({
      ok: true,
      users: rows,
      pagination: { page, limit, total: count }
    });
  } catch (e) { next(e); }
};

// PUT /api/admin/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ ok:false, error:'Datos inválidos', details: errors.array() });

    const { id } = req.params;
    const patch = {};
    ['nombre','email','rol','activo'].forEach(k => {
      if (k in req.body) patch[k] = req.body[k];
    });

    const [n] = await User.update(patch, { where: { id } });
    if (!n) return res.status(404).json({ ok:false, error:'Usuario no encontrado' });

    const user = await User.findByPk(id, { attributes: ['id','nombre','email','rol','activo','createdAt'] });
    res.json({ ok:true, user });
  } catch (e) { next(e); }
};

/** ==================== PAQUETES ==================== */
// GET /api/admin/packages?q=&status=&page=1&limit=20
export const listPackages = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();       // tracking de paquete (like)
    const status = String(req.query.status || '').trim();
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);  // por defecto 50
    const offset = (page - 1) * limit;

    const where = {};
    if (q) where.tracking = { [Op.like]: `%${q}%` };
    if (status) where.status = status;

    // Traemos Shipment y User para enriquecer
    const { rows, count } = await Package.findAndCountAll({
      where,
      order: [['createdAt','DESC']],
      limit, offset,
      attributes: ['id','tracking','status','shipmentId','pesoKg','largoCm','anchoCm','altoCm','createdAt'],
    });

    const data = await Promise.all(rows.map(async (p) => {
      const sh = await Shipment.findByPk(p.shipmentId, {
        attributes: ['tracking','status','recipientName','recipientAddress','userId']
      });
      let senderName = null;
      if (sh?.userId) {
        const u = await User.findByPk(sh.userId, { attributes: ['nombre','email'] });
        senderName = u?.nombre || u?.email || null;
      }
      return {
        id: p.id,
        tracking: p.tracking,
        status: p.status,
        shipmentTracking: sh?.tracking || null,
        shipmentStatus: sh?.status || null,
        recipientName: sh?.recipientName || null,
        recipientAddress: sh?.recipientAddress || null,
        senderName,
        pesoKg: p.pesoKg,
        dimensiones: { largoCm: p.largoCm, anchoCm: p.anchoCm, altoCm: p.altoCm },
        createdAt: p.createdAt
      };
    }));

    res.json({
      ok: true,
      packages: data,
      pagination: { page, limit, total: count }
    });
  } catch (e) { next(e); }
};

/** ==================== TRACKING/ENCOMIENDAS ==================== */
// GET /api/admin/shipments/:tracking/packages
// Ahora acepta tracking MAESTRO o tracking de PAQUETE.
export const getShipmentPackages = async (req, res, next) => {
  try {
    const { tracking } = req.params;

    // 1) Intentar como Shipment
    let sh = await Shipment.findOne({ where: { tracking } });

    // 2) Si no existe, intentar como Package → resolvemos Shipment
    if (!sh) {
      const pkg = await Package.findOne({ where: { tracking }, attributes: ['shipmentId'] });
      if (pkg) sh = await Shipment.findByPk(pkg.shipmentId);
    }

    if (!sh) return res.status(404).json({ ok: false, error: 'Envío no encontrado' });

    const pkgs = await Package.findAll({
      where: { shipmentId: sh.id },
      order: [['id','ASC']],
      attributes: ['id','tracking','status','pesoKg','largoCm','anchoCm','altoCm','createdAt']
    });

    // Enriquecer con sender/recipient para UI
    let senderName = null;
    if (sh.userId) {
      const u = await User.findByPk(sh.userId, { attributes: ['nombre','email'] });
      senderName = u?.nombre || u?.email || null;
    }

    const packages = pkgs.map(p => ({
      id: p.id,
      tracking: p.tracking,
      status: p.status,
      pesoKg: p.pesoKg,
      dimensiones: { largoCm: p.largoCm, anchoCm: p.anchoCm, altoCm: p.altoCm },
      createdAt: p.createdAt,
      // detalles comunes por paquete en UI:
      senderName,
      recipientName: sh.recipientName || null,
      recipientAddress: sh.recipientAddress || null,
      masterTracking: sh.tracking
    }));

    res.json({
      ok: true,
      shipment: {
        id: sh.id,
        tracking: sh.tracking,
        status: sh.status,
        recipientName: sh.recipientName,
        recipientAddress: sh.recipientAddress
      },
      packages
    });
  } catch (e) { next(e); }
};

// POST /api/admin/events  (igual que antes)
export const createAdminEventOrStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ ok:false, error:'Datos inválidos', details: errors.array() });

    const {
      shipmentTracking,
      packageTracking,
      applyToAll = false,
      status,
      note = '',
      location = '',
      date,
      time
    } = req.body;

    // Permitimos que shipmentTracking venga de un package (para consistencia con la UX nueva)
    let sh = await Shipment.findOne({ where: { tracking: shipmentTracking } });
    if (!sh) {
      const pkg = await Package.findOne({ where: { tracking: shipmentTracking }, attributes:['shipmentId'] });
      if (pkg) sh = await Shipment.findByPk(pkg.shipmentId);
    }
    if (!sh) return res.status(404).json({ ok:false, error:'Envío no encontrado' });

    let targetPackages = [];
    if (applyToAll) {
      targetPackages = await Package.findAll({ where: { shipmentId: sh.id } });
      if (!targetPackages.length) return res.status(400).json({ ok:false, error:'El envío no tiene paquetes' });
    } else {
      if (!packageTracking) {
        return res.status(400).json({ ok:false, error:'Debes seleccionar el tracking de paquete o elegir "aplicar a todos"' });
      }
      const p = await Package.findOne({ where: { tracking: packageTracking, shipmentId: sh.id } });
      if (!p) return res.status(404).json({ ok:false, error:'Paquete no encontrado para este envío' });
      targetPackages = [p];
    }

    const ts = composeTimestamp(date, time);

    const created = [];
    for (const p of targetPackages) {
      const ev = await TrackingEvent.create({
        shipmentId: sh.id,
        packageId: p.id,
        status,
        note,
        location,
        timestamp: ts,
        actorUserId: req.user.id
      });
      await p.update({ status });
      created.push({ packageTracking: p.tracking, eventId: ev.id });
    }

    const allPkgs = await Package.findAll({ where: { shipmentId: sh.id } });
    if (allPkgs.length && allPkgs.every(x => x.status === status)) {
      await sh.update({ status });
    }

    res.json({ ok:true, updated: created.length, detail: created });
  } catch (e) { next(e); }
};

// GET /api/admin/shipments/:tracking/labels.zip (sin cambios)
export const downloadShipmentLabelsZip = async (req, res, next) => {
  try {
    const { tracking } = req.params;
    const sh = await Shipment.findOne({ where: { tracking } });
    if (!sh) return res.status(404).json({ ok:false, error:'Envío no encontrado' });

    const pkgs = await Package.findAll({ where: { shipmentId: sh.id } });
    if (!pkgs.length) return res.status(404).json({ ok:false, error:'No hay paquetes' });

    const dir = process.env.LABELS_DIR || 'labels';
    const files = pkgs
      .map(p => ({ t: p.tracking, file: path.join(dir, `${p.tracking}.pdf`) }))
      .filter(f => fs.existsSync(f.file));

    if (!files.length) return res.status(404).json({ ok:false, error:'No hay etiquetas generadas para esta encomienda' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="labels_${tracking}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', err => next(err));
    archive.pipe(res);

    for (const f of files) {
      archive.file(f.file, { name: `${f.t}.pdf` });
    }
    await archive.finalize();
  } catch (e) { next(e); }
};
