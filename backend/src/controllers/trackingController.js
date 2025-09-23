// RUTA: backend/src/controllers/trackingController.js
import { Shipment, TrackingEvent } from '../models/index.js';

export const getTracking = async (req, res, next) => {
  try {
    const { tracking } = req.params;

    const shipment = await Shipment.findOne({ where: { tracking } });
    if (!shipment) return res.status(404).json({ ok: false, error: 'Tracking no encontrado' });

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
        amountPaid: shipment.amountPaid
      },
      events
    });
  } catch (e) { next(e); }
};
