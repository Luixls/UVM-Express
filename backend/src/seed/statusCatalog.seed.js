// RUTA: backend/src/seed/statusCatalog.seed.js
import { StatusCatalog } from '../models/index.js';

/**
 * Idempotente: inserta solo los estados faltantes y loguea por cada uno.
 * Si ya está completo, imprime un "OK (sin cambios)".
 */
export async function seedStatusCatalog() {
  const desired = [
    { code: 'ORDER_CREATED',       label: 'Orden de Envío generada',            isFinal: false },
    { code: 'IN_POSSESSION',       label: 'Paquete en nuestra posesión',        isFinal: false },
    { code: 'IN_TRANSIT',          label: 'En tránsito',                         isFinal: false },
    { code: 'DELIVERED',           label: 'Entregado',                           isFinal: true  },
    { code: 'EX_DELAY_WEATHER',    label: 'Retraso por clima',                   isFinal: false },
    { code: 'EX_MISSED_SCAN_24H',  label: '24h sin escaneo',                     isFinal: false },
    { code: 'EX_LOST',             label: 'Extravío',                            isFinal: false },
    { code: 'EX_CANCELLED_RETURN', label: 'Cancelado, en retorno',               isFinal: true  },
    { code: 'EX_BAD_ADDRESS_RETRY',label: 'Dirección errónea; reintento',        isFinal: false },
    { code: 'EX_UNDELIVERABLE_3X', label: '3 intentos fallidos; devolución',     isFinal: true  }
  ];

  // Trae lo existente
  const existing = await StatusCatalog.findAll({ attributes: ['code'] });
  const have = new Set(existing.map(x => x.code));

  let created = 0;
  let skipped = 0;

  // Inserta faltantes
  for (const row of desired) {
    if (have.has(row.code)) {
      console.log(`[seedStatusCatalog] Ya existe: ${row.code} — ${row.label}`);
      skipped++;
      continue;
    }
    await StatusCatalog.create(row);
    console.log(`[seedStatusCatalog] Creado: ${row.code} — ${row.label}`);
    created++;
  }

  if (created === 0) {
    console.log('[seedStatusCatalog] Catálogo de estados OK (sin cambios)');
  } else {
    console.log(`[seedStatusCatalog] Catálogo actualizado: ${created} nuevo(s), ${skipped} ya existente(s)`);
  }
}
