// RUTA: backend/src/controllers/shipmentController.js
import { Quote, Shipment, Package, TrackingEvent, City, User, Address } from "../models/index.js";
import { generateLabel } from "../utils/label.js";
import { generateTracking } from "../utils/generateTracking.js";

async function generateUniqueShipmentTracking() {
  for (let i = 0; i < 5; i++) {
    const t = generateTracking();
    const exists = await Shipment.findOne({ where: { tracking: t } });
    if (!exists) return t;
  }
  return generateTracking();
}
async function generateUniquePackageTracking() {
  for (let i = 0; i < 5; i++) {
    const t = generateTracking();
    const exists = await Package.findOne({ where: { tracking: t } });
    if (!exists) return t;
  }
  return generateTracking();
}

export const createShipment = async (req, res, next) => {
  try {
    const {
      quoteId,
      recipientName,
      recipientAddress,
      payAmount = 0,
      senderAddress, // opcional (si no viene, tomamos la default del usuario)
      packages = [],
    } = req.body;

    const quote = await Quote.findByPk(quoteId);
    if (!quote) return res.status(400).json({ ok: false, error: "Cotización inválida" });

    const [originCity, destCity] = await Promise.all([
      City.findByPk(quote.originCityId),
      City.findByPk(quote.destCityId),
    ]);
    if (!originCity || !destCity) {
      return res.status(400).json({ ok: false, error: "Ciudades de la cotización no disponibles" });
    }

    if (!Array.isArray(packages) || packages.length === 0) {
      return res.status(400).json({ ok: false, error: "Debes incluir al menos un paquete" });
    }

    // Remitente (usuario + default address si no se envía explícita)
    const user = await User.findByPk(req.user.id);
    const senderName = user?.nombre || "Usuario UVM";

    let senderAddr = (senderAddress || "").trim();
    if (!senderAddr) {
      const def = await Address.findOne({ where: { userId: req.user.id, isDefault: true } });
      if (def) {
        senderAddr = [def.linea1, def.linea2, def.ciudad, def.estado, def.pais, def.postal]
          .filter(Boolean).join(', ');
      } else {
        senderAddr = "Dirección no registrada";
      }
    }

    // Crear Shipment (tracking maestro por compatibilidad)
    const shipmentTracking = await generateUniqueShipmentTracking();
    const shipment = await Shipment.create({
      tracking: shipmentTracking,
      userId: req.user.id,
      recipientName: String(recipientName || "").trim(),
      recipientAddress: String(recipientAddress || "").trim(),
      declaredValueTotal: 0,
      amountTotal: quote.precio,
      amountPaid: +payAmount || 0,
      status: "ORDER_CREATED",
    });

    // Crear paquetes físicos (uno por cada unidad)
    const totalUnits = packages.reduce((acc, p) => acc + (Number(p.cantidad) || 1), 0);
    let boxIndex = 0;

    const createdPackages = [];
    for (const p of packages) {
      const cantidad = Number(p.cantidad) || 1;
      const pesoUnit = +p.pesoKg;
      const largo = +p.largoCm;
      const ancho = +p.anchoCm;
      const alto  = +p.altoCm;

      for (let i = 0; i < cantidad; i++) {
        boxIndex += 1;
        const pkgTracking = await generateUniquePackageTracking();

        const pkg = await Package.create({
          shipmentId: shipment.id,
          tracking: pkgTracking,
          status: "ORDER_CREATED",
          pesoKg: pesoUnit,
          largoCm: largo,
          anchoCm: ancho,
          altoCm: alto,
          cantidad: 1,
        });

        await TrackingEvent.create({
          shipmentId: shipment.id,
          packageId: pkg.id,
          status: "ORDER_CREATED",
          note: "Orden de envío generada",
          actorUserId: req.user.id,
        });

        await generateLabel({
          tracking: pkgTracking,
          fromName: senderName,
          fromAddress: senderAddr,
          originCenter: `UVM Express - Centro Logístico ${String(originCity.nombre || '').toUpperCase()}${originCity.estado ? `, ${String(originCity.estado).toUpperCase()}` : ''}${originCity.pais ? `, ${String(originCity.pais).toUpperCase()}` : ''}.`,
          toName: shipment.recipientName,
          toAddress: shipment.recipientAddress,
          toCityStateCountry: `${destCity.nombre}${destCity.estado ? `, ${destCity.estado}` : ''}${destCity.pais ? `, ${destCity.pais}` : ''}`,
          pesoKg: Number(pesoUnit).toFixed(2),
          dimensiones: { largoCm: largo, anchoCm: ancho, altoCm: alto },
          boxIndex,
          boxTotal: totalUnits,
        });

        createdPackages.push({ id: pkg.id, tracking: pkgTracking });
      }
    }

    await TrackingEvent.create({
      shipmentId: shipment.id,
      status: "ORDER_CREATED",
      note: `Orden creada con ${createdPackages.length} paquete(s)`,
      actorUserId: req.user.id,
    });

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
      packages: createdPackages,
      labels: createdPackages.map(p => `/labels/${p.tracking}.pdf`)
    });
  } catch (e) {
    next(e);
  }
};
