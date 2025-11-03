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

async function resolveQuoteForShipment (shipment) {
  if (shipment.quoteId) {
    const q = await Quote.findByPk(shipment.quoteId)
    if (q) return q
  }

  if (!shipment.userId || !shipment.createdAt) return null

  const before = new Date(shipment.createdAt)
  const after = new Date(shipment.createdAt)
  before.setHours(before.getHours() - 24)
  after.setHours(after.getHours() + 24)

  const q = await Quote.findOne({
    where: {
      userId: shipment.userId,
      createdAt: { [Op.between]: [before, after] }
    },
    order: [['createdAt', 'DESC']]
  })
  return q
}

/**
 * GET /api/tracking/:tracking
 * Acepta tracking de Shipment o de Package.
 * Cambios claves:
 *  - Primero intentamos como tracking de **paquete**. Si existe, filtramos por packageId.
 *  - Si no es paquete, probamos como tracking de **envío**. En ese caso, devolvemos SOLO
 *    eventos de envío (packageId = null), para no mezclar eventos de todos los paquetes.
 */
export const getTracking = async (req, res, next) => {
  try {
    const code = String(req.params.tracking || '').trim()
    if (!code) return res.status(400).json({ ok: false, error: 'Tracking requerido' })

    // 1) PRIORIZAR tracking de PAQUETE
    let pkg = await Package.findOne({ where: { tracking: code } })
    let shipment = null
    if (pkg) {
      shipment = await Shipment.findByPk(pkg.shipmentId)
    } else {
      // 2) Si no es paquete, probar como tracking de ENVÍO
      shipment = await Shipment.findOne({ where: { tracking: code } })
      if (!shipment) return res.status(404).json({ ok: false, error: 'No encontrado' })
    }

    // 3) Eventos:
    //    - Si estamos viendo un PACKAGE: eventos SOLO de ese packageId.
    //    - Si estamos viendo un SHIPMENT (tracking de envío): SOLO eventos de envío (packageId = null)
    const eventsWhere = { shipmentId: shipment.id }
    if (pkg) {
      eventsWhere.packageId = pkg.id
    } else {
      eventsWhere.packageId = null
    }
    const events = await TrackingEvent.findAll({
      where: eventsWhere,
      order: [['timestamp', 'ASC'], ['createdAt', 'ASC']]
    })

    // 4) Otros paquetes del envío (para el cuadro final)
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

    // ============ Centros / Ubicación / ETA ============
    let originCenter = null
    let destCenter = null
    let recipientLocation = null
    let etaText = null
    let etaDate = null

    let originCity = null
    let destCity = null

    const q = await resolveQuoteForShipment(shipment)
    if (q) {
      if (q.originCityId) originCity = await City.findByPk(q.originCityId)
      if (q.destCityId) destCity = await City.findByPk(q.destCityId)
      if (q.breakdown?.eta) etaText = q.breakdown.eta
    }

    if (!originCity && shipment.originCityId) originCity = await City.findByPk(shipment.originCityId)
    if (!destCity && shipment.destCityId)   destCity   = await City.findByPk(shipment.destCityId)

    if (originCity) originCenter = buildCenterText(originCity)
    if (destCity) {
      destCenter = buildCenterText(destCity)
      recipientLocation = {
        city: destCity.nombre || null,
        state: destCity.estado || null,
        country: destCity.pais || null
      }
    }

    if (!etaText && originCity && destCity &&
        originCity.lat != null && originCity.lon != null &&
        destCity.lat != null && destCity.lon != null) {
      const distanceKm = haversineKm(+originCity.lat, +originCity.lon, +destCity.lat, +destCity.lon)
      etaText = estimateEtaDays(distanceKm)
    }
    if (etaText) {
      const addDays = (etaTextToDays(etaText) || 0)
      if (addDays > 0) {
        const dts = new Date()
        dts.setDate(dts.getDate() + addDays)
        etaDate = dts.toISOString()
      }
    }
    // ================================================

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
