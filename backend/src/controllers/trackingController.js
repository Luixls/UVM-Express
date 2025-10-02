// RUTA: backend/src/controllers/trackingController.js
import { Op } from 'sequelize'
import { Shipment, Package, TrackingEvent, Quote, City } from '../models/index.js'
import { haversineKm } from '../utils/geo.js'
import { estimateEtaDays } from '../utils/pricing.js'

// Convierte "3–6 días hábiles" -> número de días (máximo)
function etaTextToDays (etaText) {
  if (!etaText) return null
  const m =
    String(etaText).match(/(\d+)\s*[\u2013-]\s*(\d+)/) ||
    String(etaText).match(/(\d+)/)
  if (!m) return null
  const nums = m
    .slice(1)
    .map(n => parseInt(n, 10))
    .filter(n => !Number.isNaN(n))
  if (!nums.length) return null
  return Math.max(...nums)
}

// Construye el texto “UVM Express - Centro Logístico XXX, ESTADO, PAIS.”
function buildCenterText (city) {
  if (!city) return null
  return `UVM EXPRESS - CENTRO LOGÍSTICO ${String(city.nombre || '').toUpperCase()}${city.estado ? `, ${String(city.estado).toUpperCase()}` : ''}${city.pais ? `, ${String(city.pais).toUpperCase()}` : ''}.`
}

/**
 * Intenta recuperar una Quote asociada al shipment:
 * 1) Por shipment.quoteId si existe.
 * 2) Fallback sencillo: Quote del MISMO usuario +/- 24h del createdAt del shipment
 *    (la más reciente dentro de la ventana).
 */
async function resolveQuoteForShipment (shipment) {
  if (shipment.quoteId) {
    const q = await Quote.findByPk(shipment.quoteId)
    if (q) return q
  }

  // Fallback “simple” sin migraciones:
  // buscamos quotes del mismo usuario en una ventana de 24h alrededor del shipment
  if (!shipment.userId || !shipment.createdAt) return null

  const before = new Date(shipment.createdAt)
  const after = new Date(shipment.createdAt)
  before.setHours(before.getHours() - 24)
  after.setHours(after.getHours() + 24)

  const q = await Quote.findOne({
    where: {
      userId: shipment.userId,
      createdAt: {
        [Op.between]: [before, after]
      }
    },
    order: [['createdAt', 'DESC']]
  })
  return q
}

/**
 * GET /api/tracking/:tracking
 * Acepta tracking de Shipment o de Package.
 * Devuelve:
 * { ok, queriedTracking, shipment, totalPackages, events, groupEvents,
 *   originCenter?, destCenter?, recipientLocation?, etaText?, etaDate? }
 * - Si el tracking es de paquete, 'events' incluye SOLO eventos de ese paquete.
 */
export const getTracking = async (req, res, next) => {
  try {
    const code = String(req.params.tracking || '').trim()
    if (!code) return res.status(400).json({ ok: false, error: 'Tracking requerido' })

    // ¿Es tracking de shipment?
    let shipment = await Shipment.findOne({ where: { tracking: code } })
    let pkg = null

    // ¿o tracking de paquete?
    if (!shipment) {
      pkg = await Package.findOne({ where: { tracking: code } })
      if (pkg) shipment = await Shipment.findByPk(pkg.shipmentId)
    }
    if (!shipment) return res.status(404).json({ ok: false, error: 'No encontrado' })

    // Eventos (por paquete si aplica)
    const eventsQuery = {
      where: { shipmentId: shipment.id },
      order: [['timestamp', 'ASC'], ['createdAt', 'ASC']]
    }
    if (pkg) eventsQuery.where.packageId = pkg.id
    const events = await TrackingEvent.findAll(eventsQuery)

    // Otros paquetes del envío
    const packages = await Package.findAll({ where: { shipmentId: shipment.id } })
    const totalPackages = packages.length
    const groupEvents = await Promise.all(
      packages.map(async (p) => {
        const last = await TrackingEvent.findOne({
          where: { packageId: p.id },
          order: [['timestamp', 'DESC'], ['createdAt', 'DESC']]
        })
        return {
          tracking: p.tracking,
          currentStatus: last?.status || 'ORDER_CREATED',
          lastEvent: last ? { status: last.status, timestamp: last.timestamp } : null
        }
      })
    )

    // ===================== Centros / Ubicación / ETA ======================
    let originCenter = null
    let destCenter = null
    let recipientLocation = null
    let etaText = null
    let etaDate = null

    let originCity = null
    let destCity = null

    // 1) Intentar por quoteId (o fallback de 24h)
    const q = await resolveQuoteForShipment(shipment)
    if (q) {
      if (q.originCityId) originCity = await City.findByPk(q.originCityId)
      if (q.destCityId) destCity = await City.findByPk(q.destCityId)
      if (q.breakdown?.eta) etaText = q.breakdown.eta
    }

    // 2) Si tu modelo de Shipment tiene las columnas, úsalas como refuerzo
    if (!originCity && shipment.originCityId) {
      originCity = await City.findByPk(shipment.originCityId)
    }
    if (!destCity && shipment.destCityId) {
      destCity = await City.findByPk(shipment.destCityId)
    }

    // Armar textos/ubicaciones si logramos recuperar ciudades
    if (originCity) originCenter = buildCenterText(originCity)
    if (destCity) {
      destCenter = buildCenterText(destCity)
      recipientLocation = {
        city: destCity.nombre || null,
        state: destCity.estado || null,
        country: destCity.pais || null
      }
    }

    // 3) ETA: si aún no tenemos, calcular con Haversine + estimateEtaDays
    if (!etaText && originCity && destCity && originCity.lat != null && originCity.lon != null && destCity.lat != null && destCity.lon != null) {
      const distanceKm = haversineKm(+originCity.lat, +originCity.lon, +destCity.lat, +destCity.lon)
      etaText = estimateEtaDays(distanceKm) // "x–y días hábiles"
    }
    if (etaText) {
      const addDays = etaTextToDays(etaText)
      if (addDays) {
        const dts = new Date()
        dts.setDate(dts.getDate() + addDays)
        etaDate = dts.toISOString()
      }
    }
    // ======================================================================

    res.json({
      ok: true,
      queriedTracking: code,
      shipment: {
        id: shipment.id,
        tracking: shipment.tracking,
        status: shipment.status,
        amountTotal: shipment.amountTotal,
        amountPaid: shipment.amountPaid,
        recipientName: shipment.recipientName,
        recipientAddress: shipment.recipientAddress
      },
      totalPackages,
      events,
      groupEvents,
      ...(originCenter ? { originCenter } : {}),
      ...(destCenter ? { destCenter } : {}),
      ...(recipientLocation ? { recipientLocation } : {}),
      ...(etaText ? { etaText } : {}),
      ...(etaDate ? { etaDate } : {})
    })
  } catch (e) { next(e) }
}
