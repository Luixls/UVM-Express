// RUTA: backend/src/controllers/shipmentController.js
import { Quote, Shipment, Package, TrackingEvent } from "../models/index.js";
import { generateLabel } from "../utils/label.js";
import { generateTracking } from "../utils/generateTracking.js";

/**
 * Genera un tracking único verificando contra la BD.
 * Intenta hasta 5 veces antes de devolver uno más (la columna unique también protege).
 */
async function generateUniqueTracking() {
  for (let i = 0; i < 5; i++) {
    const t = generateTracking();
    const exists = await Shipment.findOne({ where: { tracking: t } });
    if (!exists) return t;
  }
  // Último intento; si colisiona, el constraint UNIQUE del modelo lo evitará.
  return generateTracking();
}

export const createShipment = async (req, res, next) => {
  try {
    const {
      quoteId,
      recipientName,
      recipientAddress,
      packages = [],
      payAmount = 0,
    } = req.body;

    // 1) Validar cotización
    const quote = await Quote.findByPk(quoteId);
    if (!quote) {
      return res.status(400).json({ ok: false, error: "Cotización inválida" });
    }

    // 2) Crear Shipment con tracking (único)
    const tracking = await generateUniqueTracking();
    const shipment = await Shipment.create({
      tracking,
      userId: req.user.id,
      recipientName: String(recipientName || "").trim(),
      recipientAddress: String(recipientAddress || "").trim(),
      declaredValueTotal: 0,
      amountTotal: quote.precio,
      amountPaid: +payAmount || 0,
      status: "ORDER_CREATED",
    });

    // 3) Guardar paquetes
    for (const p of packages) {
      await Package.create({
        shipmentId: shipment.id,
        pesoKg: +p.pesoKg,
        largoCm: +p.largoCm,
        anchoCm: +p.anchoCm,
        altoCm: +p.altoCm,
        cantidad: +p.cantidad || 1,
      });
    }

    // 4) Evento de tracking inicial
    await TrackingEvent.create({
      shipmentId: shipment.id,
      status: "ORDER_CREATED",
      note: "Orden de envío generada",
      actorUserId: req.user.id,
    });

    // 5) Generar etiqueta PDF
    const pesoTotal = packages.reduce(
      (s, p) => s + Number(p.pesoKg || 0) * Number(p.cantidad || 1),
      0
    );
    await generateLabel({
      tracking,
      from: "UVM Express - Centro Logístico",
      to: `${shipment.recipientName} — ${shipment.recipientAddress}`,
      pesoKg: pesoTotal.toFixed(2),
    });

    // 6) Responder
    res.status(201).json({
      ok: true,
      shipment,
      labelUrl: `/labels/${tracking}.pdf`,
    });
  } catch (e) {
    next(e);
  }
};
