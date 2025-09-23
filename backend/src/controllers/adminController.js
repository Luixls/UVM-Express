// RUTA: backend/src/controllers/adminController.js
import dayjs from 'dayjs';
import { Shipment, TrackingEvent } from '../models/index.js';

/**
 * Actualiza el estado de un envío y agrega un TrackingEvent.
 * Body:
 *  - status: string (obligatorio)
 *  - note?: string
 *  - location?: string
 *  - etaDays?: number   -> calcula etaDate = hoy + etaDays
 */
export const updateStatus = async (req, res, next) => {
  try {
    const { tracking } = req.params;
    const { status, note, location, etaDays } = req.body;

    const shipment = await Shipment.findOne({ where: { tracking } });
    if (!shipment) return res.status(404).json({ ok: false, error: 'Envío no encontrado' });

    shipment.status = status;
    await shipment.save();

    const etaDate = etaDays ? dayjs().add(etaDays, 'day').toDate() : null;

    const event = await TrackingEvent.create({
      shipmentId: shipment.id,
      status,
      note,
      location,
      etaDate,
      actorUserId: req.user.id
    });

    res.json({ ok: true, shipment: { tracking: shipment.tracking, status: shipment.status }, event });
  } catch (e) { next(e); }
};
