// RUTA: backend/src/controllers/trackingController.js
import { Shipment, TrackingEvent } from '../models/index.js';

export const getTracking = async (req, res, next) => {
  try {
    const raw = (req.params.tracking || '').trim();
    const upper = raw.toUpperCase();

    // Variante "limpia" SIN símbolos (por si el tracking viejo se guardó sin guiones)
    const alnum = upper.replace(/[^A-Z0-9]/g, '');

    let shipment = await Shipment.findOne({ where: { tracking: upper } });
    if (!shipment && alnum !== upper) {
      // Intenta también la versión alfanumérica (sin guiones)
      shipment = await Shipment.findOne({ where: { tracking: alnum } });
    }

    if (!shipment) {
      return res.status(404).json({ ok: false, error: 'Tracking no encontrado' });
    }

    const events = await TrackingEvent.findAll({
      where: { shipmentId: shipment.id },
      order: [['timestamp', 'ASC']]
    });

    res.json({
      ok: true,
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
    // Log claro en servidor
    console.error('[getTracking] Error:', e?.message, e?.parent?.sqlMessage || '');
    next(e);
  }
};
