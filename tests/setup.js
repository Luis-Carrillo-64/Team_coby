import mongoose from 'mongoose';
import { vi } from 'vitest';

// Configuración global para las pruebas
global.vi = vi;

// Silenciar logs durante las pruebas
console.log = vi.fn();
console.error = vi.fn();
console.warn = vi.fn();

// Aumentar el timeout para operaciones de base de datos
vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
  teardownTimeout: 30000
});

// Configuración del entorno de pruebas
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/pokedex-test';

// Limpiar la base de datos después de cada prueba
afterEach(async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
});

// Cerrar la conexión a MongoDB después de todas las pruebas
afterAll(async () => {
  await mongoose.connection.close();
}); 