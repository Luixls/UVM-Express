// RUTA: backend/src/utils/statusRules.js
export const FINAL_STATES = new Set([
  'DELIVERED',
  'EX_CANCELLED_RETURN',
  'EX_UNDELIVERABLE_3X',
  'EX_LOST'
]);

const FLOW = {
  ORDER_CREATED: new Set(['IN_POSSESSION', 'EX_CANCELLED_RETURN']),
  IN_POSSESSION: new Set(['IN_TRANSIT', 'EX_DELAY_WEATHER', 'EX_MISSED_SCAN_24H', 'EX_BAD_ADDRESS_RETRY', 'EX_CANCELLED_RETURN']),
  IN_TRANSIT: new Set([
    'DELIVERED',
    'EX_DELAY_WEATHER',
    'EX_MISSED_SCAN_24H',
    'EX_BAD_ADDRESS_RETRY',
    'EX_UNDELIVERABLE_3X',
    'EX_LOST',
    'EX_CANCELLED_RETURN'
  ]),
  DELIVERED: new Set([]),

  // Excepciones pueden volver a IN_TRANSIT (salvo estados finales)
  EX_DELAY_WEATHER: new Set(['IN_TRANSIT']),
  EX_MISSED_SCAN_24H: new Set(['IN_TRANSIT']),
  EX_BAD_ADDRESS_RETRY: new Set(['IN_TRANSIT']),
  EX_CANCELLED_RETURN: new Set([]),   // final (retorno)
  EX_UNDELIVERABLE_3X: new Set([]),   // final
  EX_LOST: new Set([])                // final
};

export const isValidTransition = (from, to) => {
  if (from === to) return true;
  const allowed = FLOW[from];
  return allowed ? allowed.has(to) : false;
};
