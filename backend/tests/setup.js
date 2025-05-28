// Configuración del entorno de pruebas
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/pokedex-test';

// Configuración global de Jest
jest.setTimeout(30000); // 30 segundos

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