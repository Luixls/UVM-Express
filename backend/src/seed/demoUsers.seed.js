// RUTA: backend/src/seed/demoUsers.seed.js
import { User, Address } from '../models/index.js';

export async function seedDemoUsersAndAddresses() {
  // Usuario 1 (cliente)
  const user1 = await User.create({
    nombre: 'Luis Arrieta',
    email: 'luis@uvm.local',
    telefono: '+58 426 000 0000',
    rol: 'usuario',
    passwordHash: 'temp'
  });
  await user1.setPassword('Usuario123!'); // contraseña demo
  await user1.save();

  const addr1 = await Address.create({
    userId: user1.id,
    alias: 'Casa',
    linea1: 'Av. Principal 123, Torre A, Piso 4',
    linea2: 'Urbanización Centro',
    ciudad: 'Valera',
    estado: 'Trujillo',
    pais: 'VE',
    postal: '3101',
    isDefault: true
  });

  // Usuario 2 (cliente)
  const user2 = await User.create({
    nombre: 'María López',
    email: 'maria@uvm.local',
    telefono: '+58 414 111 1111',
    rol: 'usuario',
    passwordHash: 'temp'
  });
  await user2.setPassword('Usuario123!');
  await user2.save();

  const addr2 = await Address.create({
    userId: user2.id,
    alias: 'Oficina',
    linea1: 'Calle 8, Edif. Mérida Center',
    linea2: 'Oficina 12',
    ciudad: 'Mérida',
    estado: 'Mérida',
    pais: 'VE',
    postal: '5101',
    isDefault: true
  });

  return { user1, user2, addr1, addr2 };
}
