// RUTA: backend/src/utils/pricing.js
export const PRICING = {
  BASE_FEE: 3.0,       // tarifa base
  KM_RATE: 0.35,       // $ por km
  KG_RATE: 1.8,        // $ por kg cobrado
  FUEL_SURCHARGE: 0.08, // recargo combustible (8%)
  INSURANCE_RATE: 0.01, // seguro opcional (1% del valor declarado)
  VOL_DIVISOR: 5000     // divisor peso volumétrico (cm)
};

export const volumetricKg = (l, w, h, divisor = PRICING.VOL_DIVISOR) => (l * w * h) / divisor;

export const estimateEtaDays = (distanceKm) => {
  if (distanceKm <= 150) return '1–2 días hábiles';
  if (distanceKm <= 800) return '2–4 días hábiles';
  return '4–7 días hábiles';
};

export const quotePrice = ({ distanceKm, pesoRealKg, l, w, h, cantidad, declaredValueTotal = 0 }) => {
  const vol = volumetricKg(l, w, h);
  const pesoCobrado = Math.max(pesoRealKg, vol);
  const subtotal = PRICING.BASE_FEE + PRICING.KM_RATE * distanceKm + PRICING.KG_RATE * pesoCobrado * cantidad;
  const recargos = subtotal * PRICING.FUEL_SURCHARGE + declaredValueTotal * PRICING.INSURANCE_RATE;
  const precio = +(subtotal + recargos).toFixed(2);
  return {
    precio,
    pesoCobradoKg: +pesoCobrado.toFixed(2),
    subtotal: +subtotal.toFixed(2),
    recargos: +recargos.toFixed(2)
  };
};
