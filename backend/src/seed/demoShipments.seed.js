// RUTA: backend/src/seed/demoShipments.seed.js
import dayjs from 'dayjs';
import { City, Quote, Shipment, Package, TrackingEvent } from '../models/index.js';
import { generateTracking } from '../utils/generateTracking.js';
import { generateLabel } from '../utils/label.js';

/**
 * Crea:
 *  - 1 cotización Valera → Maracaibo
 *  - 1 envío con 5 cajas (2+3) para user1
 *  - eventos: ORDER_CREATED, IN_POSSESSION (con ETA), IN_TRANSIT
 *  - etiquetas PDF por caja
 */
export async function seedDemoShipments({ user1 }) {
  const valera = await City.findOne({ where: { nombre: 'Valera' } });
  const maracaibo = await City.findOne({ where: { nombre: 'Maracaibo' } });
  if (!valera || !maracaibo) {
    throw new Error('Ciudades de demo no están disponibles. Asegúrate de correr seedCities() primero.');
  }

  // Cotización base (multi o simple — aquí simple)
  const quote = await Quote.create({
    userId: user1.id,
    originCityId: valera.id,
    destCityId: maracaibo.id,
    distanceKm: 320.00,
    pesoCobradoKg: 5.00,
    precio: 47.80,
    breakdown: { demo: true, eta: '2–4 días hábiles' },
    expiresAt: dayjs().add(1, 'day').toDate()
  });

  // Shipment maestro
  const shipmentTracking = generateTracking();
  const shipment = await Shipment.create({
    tracking: shipmentTracking,
    userId: user1.id,
    recipientName: 'FOTOMAX C.A.',
    recipientAddress: 'Av. Principal, Calle 2, CC El Vigia',
    declaredValueTotal: 0,
    amountTotal: quote.precio,
    amountPaid: 5.00,
    status: 'ORDER_CREATED'
  });

  // Paquetes físicos (2 + 3 = 5)
  const lotes = [
    { pesoKg: 5.00, largoCm: 10, anchoCm: 5, altoCm: 5, cantidad: 2 },
    { pesoKg: 7.00, largoCm: 30, anchoCm: 20, altoCm: 15, cantidad: 3 }
  ];

  let totalUnits = lotes.reduce((s, p) => s + (p.cantidad || 1), 0);
  let boxIndex = 0;

  const packages = [];
  for (const p of lotes) {
    for (let i = 0; i < p.cantidad; i++) {
      boxIndex += 1;
      const pkg = await Package.create({
        shipmentId: shipment.id,
        tracking: generateTracking(),
        status: 'ORDER_CREATED',
        pesoKg: p.pesoKg,
        largoCm: p.largoCm,
        anchoCm: p.anchoCm,
        altoCm: p.altoCm,
        cantidad: 1
      });

      // Evento inicial por paquete
      await TrackingEvent.create({
        shipmentId: shipment.id,
        packageId: pkg.id,
        status: 'ORDER_CREATED',
        note: 'Orden de envío generada (seed)',
        actorUserId: user1.id,
        timestamp: dayjs().subtract(2, 'hour').toDate()
      });

      // Etiqueta por paquete (best effort)
      try {
        await generateLabel({
          tracking: pkg.tracking,
          fromName: 'Luis Arrieta',
          fromAddress: 'Av. Principal 123, Torre A, Piso 4, Valera',
          originCenter: 'UVM Express - Centro Logístico VALERA, TRUJILLO, VENEZUELA.',
          toName: shipment.recipientName,
          toAddress: shipment.recipientAddress,
          toCityStateCountry: 'Maracaibo, Zulia, VE',
          pesoKg: p.pesoKg,
          dimensiones: { largoCm: p.largoCm, anchoCm: p.anchoCm, altoCm: p.altoCm },
          boxIndex,
          boxTotal: totalUnits
        });
      } catch (e) {
        console.warn('Etiqueta falló (seed):', e?.message || e);
      }

      packages.push(pkg);
    }
  }

  // Eventos generales & en tránsito (uno general y uno por paquete)
  const eta = dayjs().add(3, 'day').toDate();

  await TrackingEvent.create({
    shipmentId: shipment.id,
    status: 'IN_POSSESSION',
    note: 'Recibido en centro logístico Valera',
    location: 'Valera, VE',
    etaDate: eta,
    actorUserId: user1.id,
    timestamp: dayjs().subtract(90, 'minute').toDate()
  });

  for (const pkg of packages) {
    await TrackingEvent.create({
      shipmentId: shipment.id,
      packageId: pkg.id,
      status: 'IN_TRANSIT',
      note: 'En tránsito hacia destino',
      location: 'En ruta',
      etaDate: eta,
      actorUserId: user1.id,
      timestamp: dayjs().subtract(30, 'minute').toDate()
    });
    // Reflejar estado del paquete
    pkg.status = 'IN_TRANSIT';
    await pkg.save();
  }

  // Reflejar estado del envío maestro
  shipment.status = 'IN_POSSESSION';
  await shipment.save();

  return { quote, shipment, packages };
}
