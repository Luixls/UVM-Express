// RUTA: backend/src/controllers/quoteController.js
import { City, Quote } from '../models/index.js'
import { haversineKm } from '../utils/geo.js'
import { PRICING, volumetricKg, estimateEtaDays, quotePrice } from '../utils/pricing.js'

/**
 * Cotización simple (un paquete)
 * Body:
 *  - originCityId, destCityId (int)
 *  - pesoKg (number), largoCm, anchoCm, altoCm (number)
 *  - cantidad (int, opcional)
 *  - declaredValueTotal (number, opcional)
 */
export const createQuote = async (req, res, next) => {
  try {
    const {
      originCityId, destCityId,
      pesoKg, largoCm, anchoCm, altoCm,
      cantidad = 1,
      declaredValueTotal = 0
    } = req.body

    const [origin, dest] = await Promise.all([
      City.findByPk(originCityId),
      City.findByPk(destCityId)
    ])
    if (!origin || !dest) {
      return res.status(400).json({ ok: false, error: 'Ciudades inválidas' })
    }

    const distanceKm = haversineKm(+origin.lat, +origin.lon, +dest.lat, +dest.lon)
    const { precio, pesoCobradoKg, subtotal, recargos } = quotePrice({
      distanceKm,
      pesoRealKg: +pesoKg,
      l: +largoCm, w: +anchoCm, h: +altoCm,
      cantidad: +cantidad,
      declaredValueTotal: +declaredValueTotal
    })

    const eta = estimateEtaDays(distanceKm)

    const quote = await Quote.create({
      userId: req.user?.id || null,
      originCityId, destCityId,
      distanceKm,
      pesoCobradoKg,
      precio,
      breakdown: { subtotal, recargos, eta, type: 'single' },
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
    })

    res.status(201).json({ ok: true, quote, eta })
  } catch (e) { next(e) }
}

/**
 * Cotización MULTI (varios paquetes)
 * Body:
 *  - originCityId, destCityId (int)
 *  - packages: [{ pesoKg, largoCm, anchoCm, altoCm, cantidad, declaredValue }]
 *
 * Reglas:
 *  - Se cobra una sola vez BASE_FEE + KM_RATE*distancia (base de envío)
 *  - Por paquete: (KG_RATE * pesoCobrado) + compLogístico
 *  - Del 2º paquete en adelante, el componente logístico tiene DESCUENTO
 *  - Combustible: FUEL_SURCHARGE sobre el subtotal "core"
 *  - Seguro: INSURANCE_RATE sobre el valor declarado por paquete
 */
export const quoteMulti = async (req, res, next) => {
  try {
    const { originCityId, destCityId, packages = [] } = req.body

    const [origin, dest] = await Promise.all([
      City.findByPk(originCityId),
      City.findByPk(destCityId)
    ])
    if (!origin || !dest) {
      return res.status(400).json({ ok: false, error: 'Ciudades inválidas' })
    }
    if (!Array.isArray(packages) || packages.length === 0) {
      return res.status(400).json({ ok: false, error: 'Debes incluir al menos un paquete' })
    }

    // Parámetros de “economía de escala”
    const LOGISTIC_COMPONENT = 3.0                 // USD por paquete (referencial)
    const DISCOUNT_AFTER_FIRST = 0.25              // 25% de descuento a partir del segundo paquete

    const distanceKm = haversineKm(+origin.lat, +origin.lon, +dest.lat, +dest.lon)
    const baseDistCost = PRICING.BASE_FEE + PRICING.KM_RATE * distanceKm

    let subtotalCore = baseDistCost           // base solo se aplica UNA vez
    let segurosTotal = 0
    let pesoCobradoKgTotal = 0

    const breakdownPackages = packages.map((p, idx) => {
      const cantidad = +p.cantidad || 1
      const pesoUnit = +p.pesoKg
      const l = +p.largoCm, w = +p.anchoCm, h = +p.altoCm
      const declaredUnit = +(p.declaredValue || 0)

      const volUnit = volumetricKg(l, w, h, PRICING.VOL_DIVISOR) // por unidad
      const pesoCobradoUnit = Math.max(pesoUnit, volUnit)
      const pesoCobrado = pesoCobradoUnit * cantidad

      const costoPeso = PRICING.KG_RATE * pesoCobrado
      let compLog = LOGISTIC_COMPONENT
      if (idx >= 1) compLog = compLog * (1 - DISCOUNT_AFTER_FIRST)

      const seguroPkg = declaredUnit * cantidad * PRICING.INSURANCE_RATE

      // Sumarizadores
      subtotalCore += (costoPeso + compLog)
      segurosTotal += seguroPkg
      pesoCobradoKgTotal += pesoCobrado

      const totalPkg = +(costoPeso + compLog + seguroPkg).toFixed(2)

      return {
        index: idx + 1,
        peso: +pesoCobrado.toFixed(2),
        costoPeso: +costoPeso.toFixed(2),
        compLog: +compLog.toFixed(2),
        seguro: +seguroPkg.toFixed(2),
        total: totalPkg
      }
    })

    const recargoCombustible = +(subtotalCore * PRICING.FUEL_SURCHARGE).toFixed(2)
    const total = +(subtotalCore + recargoCombustible + segurosTotal).toFixed(2)
    const eta = estimateEtaDays(distanceKm)

    // Guardar Quote (multi) para tener un ID que el frontend use al crear el envío
    const quote = await Quote.create({
      userId: req.user?.id || null,
      originCityId, destCityId,
      distanceKm,
      pesoCobradoKg: +pesoCobradoKgTotal.toFixed(2),
      precio: total,
      breakdown: {
        type: 'multi',
        distanceKm: +distanceKm.toFixed(2),
        baseDistCost: +baseDistCost.toFixed(2),
        subtotalCore: +subtotalCore.toFixed(2),
        recargoCombustible,
        segurosTotal: +segurosTotal.toFixed(2),
        packages: breakdownPackages,
        eta
      },
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
    })

    // Respuesta para el frontend unificado
    res.status(201).json({
      ok: true,
      eta,
      total,
      quote,                 // 👈 incluye quote.id
      packages: breakdownPackages
    })
  } catch (e) { next(e) }
}
