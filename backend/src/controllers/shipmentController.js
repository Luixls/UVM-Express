// RUTA: backend/src/controllers/shipmentController.js
import { nanoid } from 'nanoid';
import { Quote, Shipment, Package, TrackingEvent } from '../models/index.js';
import { generateLabel } from '../utils/label.js';

export const createShipment = async (req, res, next) => {
  try {
    const { quoteId, recipientName, recipientAddress, packages = [], payAmount = 0 } = req.body;

    // 1) Validar cotización
    const quote = await Quote.findByPk(quoteId);
    if (!quote) return res.status(400).json({ ok: false, error: 'Cotización inválida' });

    // 2) Crear Shipment con tracking
    const tracking = 'UV' + nanoid(10).toUpperCase();
    const shipment = await Shipment.create({
      tracking,
      userId: req.user.id,
      recipientName,
      recipientAddress,
      declaredValueTotal: 0,
      amountTotal: quote.precio,
      amountPaid: +payAmount || 0,
      status: 'ORDER_CREATED'
    });

    // 3) Guardar paquetes
    for (const p of packages) {
      await Package.create({
        shipmentId: shipment.id,
        pesoKg: +p.pesoKg,
        largoCm: +p.largoCm,
        anchoCm: +p.anchoCm,
        altoCm: +p.altoCm,
        cantidad: +p.cantidad || 1
      });
    }

    // 4) Evento de tracking inicial
    await TrackingEvent.create({
      shipmentId: shipment.id,
      status: 'ORDER_CREATED',
      note: 'Orden de envío generada',
      actorUserId: req.user.id
    });

    // 5) Generar etiqueta PDF
    const pesoTotal = packages.reduce((s, p) => s + Number(p.pesoKg || 0) * Number(p.cantidad || 1), 0);
    const labelPath = await generateLabel({
      tracking,
      from: 'UVM Express - Centro Logístico',
      to: `${recipientName} — ${recipientAddress}`,
      pesoKg: pesoTotal.toFixed(2)
    });

    // 6) Responder
    res.status(201).json({
      ok: true,
      shipment,
      labelUrl: `/labels/${tracking}.pdf`
    });
  } catch (e) {
    next(e);
  }
};
