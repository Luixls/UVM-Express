// RUTA: backend/src/utils/generateTracking.js
export function generateTracking() {
  const prefix = 'UVM';
  const tenDigits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
  const letters = ['U', 'V', 'M', 'Z', 'V', 'J', 'L', 'P']; // V aparece 2 veces a propósito
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const lastTwo = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return prefix + tenDigits + randomLetter + lastTwo;
}
