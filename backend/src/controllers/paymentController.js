// RUTA: backend/src/controllers/paymentController.js
import { Shipment, Payment } from '../models/index.js';
import { FINAL_STATES } from '../utils/statusRules.js';

const canViewShipment = (req, shipment) => {
  return req.user?.rol === 'admin' || shipment.userId === req.user?.id;
};

export const listPayments = async (req, res, next) => {
  try {
    const { tracking } = req.params;
    const shipment = await Shipment.findOne({ where: { tracking } });
    if (!shipment) return res.status(404).json({ ok: false, error: 'Envío no encontrado' });
    if (!canViewShipment(req, shipment)) return res.status(403).json({ ok: false, error: 'No autorizado' });

    const items = await Payment.findAll({ where: { shipmentId: shipment.id }, order: [['id', 'ASC']] });
    res.json({ ok: true, payments: items, summary: {
      amountTotal: shipment.amountTotal,
      amountPaid: shipment.amountPaid,
      paymentStatus: shipment.paymentStatus
    }});
  } catch (e) { next(e); }
};

export const createPayment = async (req, res, next) => {
  try {
    const { tracking } = req.params;
    const { method = 'efectivo', amount, transactionRef } = req.body;

    const shipment = await Shipment.findOne({ where: { tracking } });
    if (!shipment) return res.status(404).json({ ok: false, error: 'Envío no encontrado' });
    if (!canViewShipment(req, shipment)) return res.status(403).json({ ok: false, error: 'No autorizado' });

    // 🔒 Bloqueos adicionales
    if (FINAL_STATES.has(shipment.status)) {
      return res.status(400).json({ ok: false, error: `No se aceptan pagos en estado final: ${shipment.status}` });
    }
    if (shipment.paymentStatus === 'pagado') {
      return res.status(400).json({ ok: false, error: 'El envío ya está pagado en su totalidad' });
    }

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ ok: false, error: 'Monto inválido' });
    }

    const maxRemaining = Number(shipment.amountTotal) - Number(shipment.amountPaid);
    if (amt > maxRemaining + 1e-6) {
      return res.status(400).json({ ok: false, error: `Monto excede saldo. Restante: ${maxRemaining.toFixed(2)}` });
    }

    const pay = await Payment.create({
      shipmentId: shipment.id,
      method,
      amount: amt.toFixed(2),
      status: 'completado',
      transactionRef
    });

    shipment.amountPaid = Number(shipment.amountPaid) + amt;
    shipment.paymentStatus =
      shipment.amountPaid + 1e-6 >= Number(shipment.amountTotal) ? 'pagado' :
      shipment.amountPaid > 0 ? 'abonado' : 'pendiente';
    await shipment.save();

    res.status(201).json({
      ok: true,
      payment: pay,
      summary: {
        amountTotal: shipment.amountTotal,
        amountPaid: shipment.amountPaid,
        paymentStatus: shipment.paymentStatus
      }
    });
  } catch (e) { next(e); }
};
