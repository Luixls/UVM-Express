// RUTA: backend/src/utils/pricing.js
// -----------------------------------------------------------------------------
// Utilidades de precios y cotización
// Modelo de tarifas: por distancia con tramos decrecientes + tope por envío,
// costo por peso (real vs volumétrico), recargo de combustible y seguro.
// -----------------------------------------------------------------------------
//
// Esta configuración está calibrada para que envíos interurbanos/internacionales
// típicos queden en el rango $15–$80. En particular, un paquete:
//   20×20×20 cm, 15.5 kg, declarado $50, Valera(VE) → Miami(US)
// queda cercano a USD ~$40 con estos parámetros.
//
// Si luego quieres otro target, ajusta PRICING abajo (KG_RATE, topes, etc.).
// -----------------------------------------------------------------------------

export const PRICING = {
  // Costo base fijo por envío
  BASE_FEE: 2.0,

  // Peso cobrado (real vs volumétrico)
  KG_RATE: 1.2,            // USD por kg cobrado
  VOL_DIVISOR: 5000,       // divisor volumétrico (cm) -> kg

  // Recargos
  FUEL_SURCHARGE: 0.03,    // 3% sobre el subtotal core
  INSURANCE_RATE: 0.005,   // 0.5% del valor declarado (suma de paquetes)

  // Tramos por distancia (USD por km)
  // Valores modestos + tope para evitar totales absurdos en largas distancias
  KM_RATE_NEAR: 0.03,      // 0–300 km
  KM_RATE_MID:  0.015,     // 300–1500 km
  KM_RATE_FAR:  0.0075,    // 1500+ km

  // Tope del costo por distancia por envío (clave para mantener precios bajos)
  MAX_DISTANCE_COST: 18,   // USD (cap a la suma de los tramos)

  // Tope total recomendado por envío (puede dejarse alto o desactivar con null)
  MAX_TOTAL_PER_SHIPMENT: 199,
};

// ----------------------------- Helpers ---------------------------------------

/** Peso volumétrico (kg) dado LxAxH en cm. */
export function volumetricKg(largoCm, anchoCm, altoCm, divisor = PRICING.VOL_DIVISOR) {
  const v = (Number(largoCm) || 0) * (Number(anchoCm) || 0) * (Number(altoCm) || 0);
  return v > 0 && divisor > 0 ? v / divisor : 0;
}

/** ETA (días hábiles) estimada a partir de la distancia. */
export function estimateEtaDays(distanceKm = 0) {
  const d = Number(distanceKm) || 0;
  if (d <= 100) return '1–2 días hábiles';
  if (d <= 400) return '2–4 días hábiles';
  if (d <= 1500) return '3–6 días hábiles';
  return '4–7 días hábiles';
}

/**
 * Costo por distancia usando tramos + tope.
 * - 0–300 km   => KM_RATE_NEAR
 * - 300–1500   => KM_RATE_MID
 * - 1500+      => KM_RATE_FAR
 * - Tope final => MAX_DISTANCE_COST
 */
export function distanceCost(km = 0) {
  const d = Math.max(0, Number(km) || 0);
  let cost = 0;

  const near = Math.min(d, 300);
  cost += near * PRICING.KM_RATE_NEAR;

  if (d > 300) {
    const mid = Math.min(d - 300, 1200); // 300–1500
    cost += mid * PRICING.KM_RATE_MID;
  }
  if (d > 1500) {
    const far = d - 1500;
    cost += far * PRICING.KM_RATE_FAR;
  }
  return Math.min(cost, PRICING.MAX_DISTANCE_COST);
}

/**
 * Calcula el precio para un conjunto de paquetes a una distancia dada.
 * Retorna breakdown detallado y total.
 *
 * @param {Object} args
 * @param {number} args.distanceKm - distancia estimada en km
 * @param {Array}  args.packages   - [{ largoCm, anchoCm, altoCm, pesoKg, cantidad, declaredValue }]
 * @returns {Object} breakdown+total
 */
export function quotePrice({ distanceKm = 0, packages = [] } = {}) {
  // Costo fijo + distancia (ya con tope)
  let subtotalCore = PRICING.BASE_FEE + distanceCost(distanceKm);

  // Suma por paquetes (peso cobrado: real vs volumétrico)
  let declaredSum = 0;
  let kgSum = 0;

  for (const p of packages || []) {
    const qty = Math.max(1, Number(p?.cantidad) || 0);
    const pesoReal = Math.max(0, Number(p?.pesoKg) || 0);
    const pesoVol = volumetricKg(p?.largoCm, p?.anchoCm, p?.altoCm);
    const pesoCobrado = Math.max(pesoReal, pesoVol);

    kgSum += pesoCobrado * qty;
    declaredSum += Math.max(0, Number(p?.declaredValue) || 0) * qty;
  }

  // Costo por kg cobrado
  subtotalCore += PRICING.KG_RATE * kgSum;

  // Recargo combustible
  const recargoCombustible = subtotalCore * PRICING.FUEL_SURCHARGE;

  // Seguro (si hay valor declarado)
  const segurosTotal = declaredSum > 0 ? declaredSum * PRICING.INSURANCE_RATE : 0;

  // Total
  let total = subtotalCore + recargoCombustible + segurosTotal;

  // Redondeo
  subtotalCore = +subtotalCore.toFixed(2);
  const _recargo = +recargoCombustible.toFixed(2);
  const _seguro = +segurosTotal.toFixed(2);
  total = +(total).toFixed(2);

  // Tope total recomendado
  if (PRICING.MAX_TOTAL_PER_SHIPMENT != null) {
    total = Math.min(total, PRICING.MAX_TOTAL_PER_SHIPMENT);
  }

  const eta = estimateEtaDays(distanceKm);

  return {
    breakdown: {
      subtotalCore,                 // base + distancia + kg
      recargoCombustible: _recargo,
      segurosTotal: _seguro,
      eta,
      kgSum: +kgSum.toFixed(2),
      declaredSum: +declaredSum.toFixed(2),
      distanceKm: +(Number(distanceKm) || 0).toFixed(2)
    },
    total
  };
}
