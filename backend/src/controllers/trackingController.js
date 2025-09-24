// RUTA: backend/src/controllers/trackingController.js
import { Shipment, Package, TrackingEvent } from '../models/index.js';

/**
 * GET /api/tracking/:tracking
 *
 * Soporta:
 * - Tracking de PACKAGE (nuevo flujo recomendado). Devuelve:
 *      - package (el paquete consultado)
 *      - shipment (info básica de la encomienda)
 *      - packages (TODOS los paquetes de la misma encomienda)
 *      - events (solo del paquete consultado)
 *
 * - Tracking de SHIPMENT (compatibilidad con envíos antiguos). Devuelve:
 *      - shipment (info básica)
 *      - events (eventos generales del envío, sin packageId)
 *
 * Entrada tolerante:
 * - Convierte a mayúsculas y prueba también una versión "limpia" (solo A-Z/0-9)
 *   para aceptar trackings con guiones o espacios.
 */
export const getTracking = async (req, res, next) => {
  try {
    const raw = (req.params.tracking || '').trim();
    const upper = raw.toUpperCase();
    const alnum = upper.replace(/[^A-Z0-9]/g, '');

    // 1) Intentar por PACKAGE (nuevo comportamiento)
    let pkg = await Package.findOne({ where: { tracking: upper } });
    if (!pkg && alnum !== upper) {
      pkg = await Package.findOne({ where: { tracking: alnum } });
    }

    if (pkg) {
      const shipment = await Shipment.findByPk(pkg.shipmentId);

      // Eventos SOLO del paquete consultado
      const events = await TrackingEvent.findAll({
        where: { shipmentId: shipment.id, packageId: pkg.id },
        order: [['timestamp', 'ASC']]
      });

      // TODOS los paquetes de la encomienda (para que el usuario vea el conjunto)
      const allPkgs = await Package.findAll({
        where: { shipmentId: shipment.id },
        attributes: ['id', 'tracking', 'status', 'cantidad']
      });

      return res.json({
        ok: true,
        type: 'package',
        package: {
          tracking: pkg.tracking,
          status: pkg.status,
          cantidad: pkg.cantidad
        },
        shipment: {
          id: shipment.id,
          recipientName: shipment.recipientName,
          recipientAddress: shipment.recipientAddress
        },
        packages: allPkgs,
        events
      });
    }

    // 2) Intentar por SHIPMENT (compatibilidad con estructura anterior)
    let shipment = await Shipment.findOne({ where: { tracking: upper } });
    if (!shipment && alnum !== upper) {
      shipment = await Shipment.findOne({ where: { tracking: alnum } });
    }

    if (!shipment) {
      return res.status(404).json({ ok: false, error: 'Tracking no encontrado' });
    }

    const events = await TrackingEvent.findAll({
      where: { shipmentId: shipment.id, packageId: null }, // eventos "generales" del envío (sin paquete específico)
      order: [['timestamp', 'ASC']]
    });

    return res.json({
      ok: true,
      type: 'shipment',
      shipment: {
        tracking: shipment.tracking,
        status: shipment.status,
        recipientName: shipment.recipientName,
        amountTotal: shipment.amountTotal,
        amountPaid: shipment.amountPaid,
        etaDate: shipment.etaDate,
        deliveredAt: shipment.deliveredAt,
        deliveredSignature: shipment.deliveredSignature
      },
      events
    });
  } catch (e) {
    console.error('[getTracking] Error:', e?.message, e?.parent?.sqlMessage || '');
    next(e);
  }
};
