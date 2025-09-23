// RUTA: backend/src/controllers/quoteController.js
import { City, Quote } from '../models/index.js';
import { haversineKm } from '../utils/geo.js';
import { estimateEtaDays, quotePrice } from '../utils/pricing.js';

export const createQuote = async (req, res, next) => {
  try {
    const {
      originCityId,
      destCityId,
      pesoKg,
      largoCm,
      anchoCm,
      altoCm,
      cantidad = 1,
      declaredValueTotal = 0
    } = req.body;

    // Cargar ciudades
    const [origin, dest] = await Promise.all([
      City.findByPk(originCityId),
      City.findByPk(destCityId)
    ]);
    if (!origin || !dest) {
      return res.status(400).json({ ok: false, error: 'Ciudades inválidas' });
    }

    // Calcular distancia / precio / ETA
    const distanceKm = haversineKm(+origin.lat, +origin.lon, +dest.lat, +dest.lon);
    const { precio, pesoCobradoKg, subtotal, recargos } = quotePrice({
      distanceKm,
      pesoRealKg: +pesoKg,
      l: +largoCm,
      w: +anchoCm,
      h: +altoCm,
      cantidad: +cantidad,
      declaredValueTotal: +declaredValueTotal
    });
    const eta = estimateEtaDays(distanceKm);

    // Guardar cotización (opcional para invitados; aquí requerimos login)
    const quote = await Quote.create({
      userId: req.user?.id || null,
      originCityId,
      destCityId,
      distanceKm,
      pesoCobradoKg,
      precio,
      breakdown: { subtotal, recargos, eta },
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h
    });

    res.status(201).json({ ok: true, quote, eta });
  } catch (e) {
    next(e);
  }
};
