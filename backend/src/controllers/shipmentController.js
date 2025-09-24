// RUTA: backend/src/controllers/shipmentController.js
import { Quote, Shipment, Package, TrackingEvent } from "../models/index.js";
import { generateLabel } from "../utils/label.js";
import { generateTracking } from "../utils/generateTracking.js";

/**
 * Genera un tracking único para SHIPMENT verificando en BD.
 * (mantenemos tracking en Shipment por compatibilidad con endpoints existentes)
 */
async function generateUniqueShipmentTracking() {
  for (let i = 0; i < 5; i++) {
    const t = generateTracking();
    const exists = await Shipment.findOne({ where: { tracking: t } });
    if (!exists) return t;
  }
  return generateTracking();
}

/**
 * Genera un tracking único para cada PACKAGE verificando en BD.
 */
async function generateUniquePackageTracking() {
  for (let i = 0; i < 5; i++) {
    const t = generateTracking();
    const exists = await Package.findOne({ where: { tracking: t } });
    if (!exists) return t;
  }
  return generateTracking();
}

/**
 * Crea un envío (Shipment) con N paquetes (Package).
 * - Mantiene tracking a nivel Shipment (compatibilidad).
 * - Genera tracking individual por paquete + etiqueta PDF por paquete.
 * - Crea evento inicial ORDER_CREATED a nivel paquete y a nivel envío.
 *
 * Body esperado:
 * {
 *   quoteId: number,
 *   recipientName: string,
 *   recipientAddress: string,
 *   payAmount?: number,
 *   packages: [{ pesoKg, largoCm, anchoCm, altoCm, cantidad }]
 * }
 */
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

    if (!Array.isArray(packages) || packages.length === 0) {
      return res.status(400).json({ ok: false, error: "Debes incluir al menos un paquete" });
    }

    // 2) Crear Shipment (tracking maestro conservado por compatibilidad)
    const shipmentTracking = await generateUniqueShipmentTracking();
    const shipment = await Shipment.create({
      tracking: shipmentTracking,
      userId: req.user.id,
      recipientName: String(recipientName || "").trim(),
      recipientAddress: String(recipientAddress || "").trim(),
      declaredValueTotal: 0,
      amountTotal: quote.precio,               // si usas multi-quote con total consolidado, envíalo en la Quote/DB
      amountPaid: +payAmount || 0,
      status: "ORDER_CREATED",
    });

    // 3) Crear paquetes con tracking individual + evento + etiqueta por paquete
    const createdPackages = [];
    for (const p of packages) {
      const pkgTracking = await generateUniquePackageTracking();
      const pkg = await Package.create({
        shipmentId: shipment.id,
        tracking: pkgTracking,
        status: "ORDER_CREATED",
        pesoKg: +p.pesoKg,
        largoCm: +p.largoCm,
        anchoCm: +p.anchoCm,
        altoCm: +p.altoCm,
        cantidad: +p.cantidad || 1,
      });

      // Evento inicial por paquete
      await TrackingEvent.create({
        shipmentId: shipment.id,
        packageId: pkg.id,
        status: "ORDER_CREATED",
        note: "Orden de envío generada",
        actorUserId: req.user.id,
      });

      // Etiqueta por paquete
      const pesoTotalPkg = Number(p.pesoKg || 0) * Number(p.cantidad || 1);
      await generateLabel({
        tracking: pkgTracking,
        from: "UVM Express - Centro Logístico",
        to: `${shipment.recipientName} — ${shipment.recipientAddress}`,
        pesoKg: pesoTotalPkg.toFixed(2),
      });

      createdPackages.push({ id: pkg.id, tracking: pkgTracking });
    }

    // 4) Evento "general" del envío (opcional, útil para mensajes de grupo)
    await TrackingEvent.create({
      shipmentId: shipment.id,
      status: "ORDER_CREATED",
      note: `Orden creada con ${createdPackages.length} paquete(s)`,
      actorUserId: req.user.id,
    });

    // 5) Responder: tracking de Shipment (compat.), lista de packages y sus labels
    res.status(201).json({
      ok: true,
      shipment: {
        id: shipment.id,
        tracking: shipment.tracking,
        status: shipment.status,
        amountTotal: shipment.amountTotal,
        amountPaid: shipment.amountPaid,
        recipientName: shipment.recipientName,
        recipientAddress: shipment.recipientAddress,
      },
      packages: createdPackages,                              // [{ id, tracking }]
      labels: createdPackages.map(p => `/labels/${p.tracking}.pdf`) // 1 etiqueta por paquete
    });
  } catch (e) {
    next(e);
  }
};
