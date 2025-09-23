// RUTA: backend/src/controllers/adminController.js
import dayjs from 'dayjs';
import { Shipment, TrackingEvent } from '../models/index.js';
import { FINAL_STATES, isValidTransition } from '../utils/statusRules.js';

/**
 * Body:
 *  - status (string)      [obligatorio]
 *  - note? (string)
 *  - location? (string)
 *  - etaDays? (number)    -> actualiza shipment.etaDate y event.etaDate
 *  - signature? (string)  -> requerido si status === 'DELIVERED'
 */
export const updateStatus = async (req, res, next) => {
  try {
    const { tracking } = req.params;
    const { status, note, location, etaDays, signature } = req.body;

    const shipment = await Shipment.findOne({ where: { tracking } });
    if (!shipment) return res.status(404).json({ ok: false, error: 'Envío no encontrado' });

    // No permitir cambios desde estados finales
    if (FINAL_STATES.has(shipment.status)) {
      return res.status(400).json({ ok: false, error: `No se puede cambiar desde estado final: ${shipment.status}` });
    }

    // Validar transición
    if (!isValidTransition(shipment.status, status)) {
      return res.status(400).json({ ok: false, error: `Transición inválida: ${shipment.status} → ${status}` });
    }

    // Reglas para DELIVERED
    let deliveredAt = null;
    if (status === 'DELIVERED') {
      if (!signature || !String(signature).trim()) {
        return res.status(400).json({ ok: false, error: 'Para marcar DELIVERED debes incluir signature (firma del receptor)' });
      }
      deliveredAt = new Date();
      shipment.deliveredAt = deliveredAt;
      shipment.deliveredSignature = String(signature).trim();
    }

    // ETA
    let etaDate = null;
    if (etaDays !== undefined && etaDays !== null) {
      const days = Number(etaDays);
      if (!Number.isFinite(days) || days < 0) {
        return res.status(400).json({ ok: false, error: 'etaDays debe ser un número >= 0' });
      }
      etaDate = dayjs().add(days, 'day').toDate();
      shipment.etaDate = etaDate;
    }

    shipment.status = status;
    await shipment.save();

    const event = await TrackingEvent.create({
      shipmentId: shipment.id,
      status,
      note,
      location,
      etaDate,
      actorUserId: req.user.id,
      timestamp: new Date()
    });

    res.json({
      ok: true,
      shipment: {
        tracking: shipment.tracking,
        status: shipment.status,
        etaDate: shipment.etaDate,
        deliveredAt: shipment.deliveredAt,
        deliveredSignature: shipment.deliveredSignature
      },
      event
    });
  } catch (e) { next(e); }
};
