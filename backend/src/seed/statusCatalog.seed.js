// RUTA: backend/src/seed/statusCatalog.seed.js
import { StatusCatalog } from '../models/index.js';

export const seedStatusCatalog = async () => {
  const count = await StatusCatalog.count();
  if (count > 0) {
    console.log('[seedStatusCatalog] Ya existe catálogo, se omite.');
    return;
  }

  const items = [
    { code: 'ORDER_CREATED',       label: 'Orden de Envío generada', isFinal: false },
    { code: 'IN_POSSESSION',       label: 'Paquete en nuestra posesión', isFinal: false },
    { code: 'IN_TRANSIT',          label: 'En tránsito', isFinal: false },
    { code: 'DELIVERED',           label: 'Entregado', isFinal: true },

    { code: 'EX_DELAY_WEATHER',    label: 'Retraso por clima/extremos', isFinal: false },
    { code: 'EX_MISSED_SCAN_24H',  label: '24h sin escaneo, localizando', isFinal: false },
    { code: 'EX_BAD_ADDRESS_RETRY',label: 'Dirección con problemas, reintento', isFinal: false },
    { code: 'EX_CANCELLED_RETURN', label: 'Envío cancelado, retorno al enviador', isFinal: true },
    { code: 'EX_UNDELIVERABLE_3X', label: 'No entregado tras 3 intentos, retorno', isFinal: true },
    { code: 'EX_LOST',             label: 'Paquete extraviado', isFinal: true }
  ];

  await StatusCatalog.bulkCreate(items);
  console.log('[seedStatusCatalog] Catálogo de estados creado.');
};
