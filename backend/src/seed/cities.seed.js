// RUTA: backend/src/seed/cities.seed.js
import { City } from '../models/index.js';

export const seedCities = async () => {
  const count = await City.count();
  if (count > 0) {
    console.log('[seedCities] Ya hay ciudades, se omite semilla.');
    return;
  }
  await City.bulkCreate([
    { pais: 'VE', estado: 'Trujillo', nombre: 'Valera',     lat: 9.3176, lon: -70.6036 },
    { pais: 'VE', estado: 'Mérida',   nombre: 'Mérida',     lat: 8.5952, lon: -71.1430 },
    { pais: 'VE', estado: 'Zulia',    nombre: 'Maracaibo',  lat: 10.6545, lon: -71.6500 },
    // Agrega aquí las ciudades que usarás en las pruebas
  ]);
  console.log('[seedCities] Ciudades iniciales creadas.');
};
