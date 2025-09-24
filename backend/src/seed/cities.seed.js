// RUTA: backend/src/seed/cities.seed.js
import { City } from '../models/index.js';

/**
 * Inserta ciudades base en varios países (país en nombre completo).
 * Evita duplicados revisando (pais, estado, nombre).
 * Imprime log por cada ciudad (creada / ya existe).
 */
export const seedCities = async () => {
  const cities = [
    // --- Venezuela ---
    { pais: 'Venezuela', estado: 'Trujillo',          nombre: 'Valera',        lat: 9.3176,  lon: -70.6036 },
    { pais: 'Venezuela', estado: 'Mérida',            nombre: 'Mérida',        lat: 8.5952,  lon: -71.1430 },
    { pais: 'Venezuela', estado: 'Zulia',             nombre: 'Maracaibo',     lat: 10.6545, lon: -71.6500 },
    { pais: 'Venezuela', estado: 'Distrito Capital',  nombre: 'Caracas',       lat: 10.4806, lon: -66.9036 },
    { pais: 'Venezuela', estado: 'Carabobo',          nombre: 'Valencia',      lat: 10.1620, lon: -68.0077 },
    { pais: 'Venezuela', estado: 'Lara',              nombre: 'Barquisimeto',  lat: 10.0678, lon: -69.3467 },

    // --- Colombia ---
    { pais: 'Colombia',  estado: 'Cundinamarca',      nombre: 'Bogotá',        lat: 4.7110,  lon: -74.0721 },
    { pais: 'Colombia',  estado: 'Antioquia',         nombre: 'Medellín',      lat: 6.2442,  lon: -75.5812 },
    { pais: 'Colombia',  estado: 'Valle del Cauca',   nombre: 'Cali',          lat: 3.4516,  lon: -76.5320 },
    { pais: 'Colombia',  estado: 'Atlántico',         nombre: 'Barranquilla',  lat: 10.9685, lon: -74.7813 },

    // --- Brasil ---
    { pais: 'Brasil',    estado: 'São Paulo',         nombre: 'São Paulo',     lat: -23.5505, lon: -46.6333 },
    { pais: 'Brasil',    estado: 'Rio de Janeiro',    nombre: 'Rio de Janeiro',lat: -22.9068, lon: -43.1729 },
    { pais: 'Brasil',    estado: 'Minas Gerais',      nombre: 'Belo Horizonte',lat: -19.9167, lon: -43.9345 },

    // --- Perú ---
    { pais: 'Perú',      estado: 'Lima',              nombre: 'Lima',          lat: -12.0464, lon: -77.0428 },
    { pais: 'Perú',      estado: 'Arequipa',          nombre: 'Arequipa',      lat: -16.4090, lon: -71.5375 },

    // --- Chile ---
    { pais: 'Chile',     estado: 'Región Metropolitana', nombre: 'Santiago',   lat: -33.4489, lon: -70.6693 },
    { pais: 'Chile',     estado: 'Valparaíso',        nombre: 'Valparaíso',    lat: -33.0472, lon: -71.6127 },

    // --- México ---
    { pais: 'México',    estado: 'CDMX',              nombre: 'Ciudad de México', lat: 19.4326, lon: -99.1332 },
    { pais: 'México',    estado: 'Jalisco',           nombre: 'Guadalajara',   lat: 20.6597, lon: -103.3496 },
    { pais: 'México',    estado: 'Nuevo León',        nombre: 'Monterrey',     lat: 25.6866, lon: -100.3161 },

    // --- Estados Unidos (USA) ---
    { pais: 'Estados Unidos', estado: 'Florida',           nombre: 'Miami',           lat: 25.7617, lon: -80.1918 },
    { pais: 'Estados Unidos', estado: 'Nueva York',        nombre: 'New York',        lat: 40.7128, lon: -74.0060 },
    { pais: 'Estados Unidos', estado: 'Nueva Jersey',      nombre: 'Newark',          lat: 40.7357, lon: -74.1724 }, // (principal en NJ)
    { pais: 'Estados Unidos', estado: 'Virginia',          nombre: 'Richmond',        lat: 37.5407, lon: -77.4360 },
    { pais: 'Estados Unidos', estado: 'Utah',              nombre: 'Salt Lake City',  lat: 40.7608, lon: -111.8910 },
    { pais: 'Estados Unidos', estado: 'Utah',              nombre: 'Provo',           lat: 40.2338, lon: -111.6585 }
  ];

  // Inserción idempotente con logs por ciudad
  for (const c of cities) {
    const exists = await City.findOne({
      where: { pais: c.pais, estado: c.estado, nombre: c.nombre }
    });
    if (exists) {
      console.log(`[seedCities] Ya existe: ${c.nombre}${c.estado ? ', ' + c.estado : ''}, ${c.pais}`);
      continue;
    }
    await City.create(c);
    console.log(`[seedCities] Creada: ${c.nombre}${c.estado ? ', ' + c.estado : ''}, ${c.pais}`);
  }
};
