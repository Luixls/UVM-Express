// RUTA: backend/src/controllers/quoteController.js
import { validationResult } from 'express-validator'
import { City, Quote } from '../models/index.js'
import { haversineKm } from '../utils/geo.js'
import { quotePrice } from '../utils/pricing.js'

/**
 * Obtiene distancia en km entre dos ciudades usando lat/lon del modelo City.
 * Acepta columnas lat/lon o latitude/longitude por compatibilidad.
 */
async function getDistanceKm (originCityId, destCityId) {
  const [o, d] = await Promise.all([
    City.findByPk(originCityId),
    City.findByPk(destCityId)
  ])
  if (!o || !d) return 0

  const a = {
    lat: Number(o.lat ?? o.latitude) || 0,
    lon: Number(o.lon ?? o.longitude) || 0
  }
  const b = {
    lat: Number(d.lat ?? d.latitude) || 0,
    lon: Number(d.lon ?? d.longitude) || 0
  }

  if (!a.lat || !a.lon || !b.lat || !b.lon) return 0
  return haversineKm(a.lat, a.lon, b.lat, b.lon)
}

/**
 * Cotización simple (un paquete)
 * Body:
 *  - originCityId, destCityId (int)
 *  - pesoKg (number), largoCm, anchoCm, altoCm (number)
 *  - cantidad (int, opcional)
 *  - declaredValueTotal (number, opcional)  -> se pasa como declaredValue del paquete
 */
export const createQuote = async (req, res, next) => {
  try {
    // si usas validators en las rutas, respetamos eso
    if (typeof validationResult === 'function') {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, error: 'Parámetros inválidos', details: errors.array() })
      }
    }

    const {
      originCityId, destCityId,
      pesoKg, largoCm, anchoCm, altoCm,
      cantidad = 1,
      declaredValueTotal = 0
    } = req.body

    const distanceKm = await getDistanceKm(originCityId, destCityId)

    const pricing = quotePrice({
      distanceKm,
      packages: [{
        pesoKg: Number(pesoKg) || 0,
        largoCm: Number(largoCm) || 0,
        anchoCm: Number(anchoCm) || 0,
        altoCm: Number(altoCm) || 0,
        cantidad: Math.max(1, parseInt(cantidad, 10) || 1),
        declaredValue: Math.max(0, Number(declaredValueTotal) || 0)
      }]
    })

    // Guardar la cotización para obtener quote.id
    const q = await Quote.create({
      userId: req.user?.id ?? null,
      originCityId,
      destCityId,
      distanceKm: +pricing.breakdown.distanceKm,            // ✅ requerido por tu modelo
      pesoCobradoKg: +pricing.breakdown.kgSum,              // ✅ requerido por tu modelo
      precio: +pricing.total,                               // total calculado
      // Guarda breakdown en el payload/breakdown (según tu esquema)
      payload: { type: 'single', breakdown: pricing.breakdown },
      breakdown: pricing.breakdown,                         // si tu modelo tiene este JSON
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h
    })

    return res.status(201).json({
      ok: true,
      quote: { id: q.id, breakdown: pricing.breakdown },
      total: pricing.total,
      eta: pricing.breakdown.eta
    })
  } catch (e) {
    next(e)
  }
}

/**
 * Cotización MULTI (varios paquetes)
 * Body:
 *  - originCityId, destCityId (int)
 *  - packages: [{ pesoKg, largoCm, anchoCm, altoCm, cantidad, declaredValue }]
 */
export const quoteMulti = async (req, res, next) => {
  try {
    if (typeof validationResult === 'function') {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, error: 'Parámetros inválidos', details: errors.array() })
      }
    }

    const { originCityId, destCityId, packages = [] } = req.body
    if (!Array.isArray(packages) || packages.length === 0) {
      return res.status(400).json({ ok: false, error: 'Debes incluir al menos un paquete' })
    }

    const distanceKm = await getDistanceKm(originCityId, destCityId)

    // Normalizamos paquetes
    const normalized = packages.map(p => ({
      pesoKg: Number(p.pesoKg) || 0,
      largoCm: parseInt(p.largoCm, 10) || 0,
      anchoCm: parseInt(p.anchoCm, 10) || 0,
      altoCm: parseInt(p.altoCm, 10) || 0,
      cantidad: Math.max(1, parseInt(p.cantidad, 10) || 1),
      declaredValue: Math.max(0, Number(p.declaredValue) || 0)
    }))

    const pricing = quotePrice({ distanceKm, packages: normalized })

    // Persistimos para obtener el id de quote y usarlo al crear el envío
    const q = await Quote.create({
      userId: req.user?.id ?? null,
      originCityId,
      destCityId,
      distanceKm: +pricing.breakdown.distanceKm,   // ✅ requerido
      pesoCobradoKg: +pricing.breakdown.kgSum,     // ✅ requerido
      precio: +pricing.total,
      payload: { type: 'multi', packages: normalized, breakdown: pricing.breakdown },
      breakdown: pricing.breakdown,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
    })

    return res.status(201).json({
      ok: true,
      quote: { id: q.id, breakdown: pricing.breakdown },
      total: pricing.total,
      eta: pricing.breakdown.eta
    })
  } catch (e) {
    next(e)
  }
}
