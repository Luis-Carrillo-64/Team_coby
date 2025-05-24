const { describe, test, expect, beforeAll, afterAll, beforeEach } = require('vitest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');
const Achievement = require('../src/models/Achievement');
const Pokemon = require('../src/models/Pokemon');
const { updateAchievementProgress } = require('../src/middleware/achievementProgress');

let mongoServer;

// Datos de prueba
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test1234!',
  completedAchievements: []
};

const testPokemon = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Bulbasaur',
  number: 1,
  types: ['Grass', 'Poison'],
  isLegendary: false,
  isBaby: false,
  canBreed: true,
  evolvesWithStone: false,
  isSupport: false,
  description: 'Pokémon semilla.',
  height: 0.7,
  weight: 6.9,
  image: 'bulbasaur.png',
  abilities: ['Overgrow'],
  stats: { hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 },
  createdBy: testUser._id
};

const testLegendary = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Mewtwo',
  number: 150,
  types: ['Psychic'],
  isLegendary: true,
  isBaby: false,
  canBreed: false,
  evolvesWithStone: false,
  isSupport: false,
  description: 'Pokémon legendario.',
  height: 2.0,
  weight: 122.0,
  image: 'mewtwo.png',
  abilities: ['Pressure'],
  stats: { hp: 106, attack: 110, defense: 90, specialAttack: 154, specialDefense: 90, speed: 130 },
  createdBy: testUser._id
};

// Configuración de tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Achievement.deleteMany({});
  await Pokemon.deleteMany({});
  
  // Crear usuario de prueba
  await User.create(testUser);
  
  // Crear Pokémon de prueba
  await Pokemon.create([testPokemon, testLegendary]);
});

describe('Sistema de Logros', () => {
  describe('Logros básicos de lectura', () => {
    test('Debería actualizar progreso para logro de lectura simple', async () => {
      // Crear logro de prueba
      const achievement = await Achievement.create({
        name: 'Primera Lectura',
        description: 'Lee tu primer Pokémon',
        criteria: {
          type: 'read_description',
          requiredCount: 1
        },
        category: 'Bronze'
      });

      await updateAchievementProgress(testUser._id, 'read_description', {
        pokemonId: testPokemon._id.toString(),
        pokemonName: testPokemon.name,
        pokemonTypes: testPokemon.types,
        pokemonGeneration: 1
      });

      const user = await User.findById(testUser._id);
      const progress = user.achievementProgress[achievement._id.toString()];
      expect(progress).toBeDefined();
      expect(progress.current).toBe(1);
      expect(user.completedAchievements).toContainEqual(achievement._id);
    });

    test('Debería manejar logros específicos de Pokémon', async () => {
      const achievement = await Achievement.create({
        name: 'El primero siempre cuenta',
        description: 'Lee la descripción de Bulbasaur',
        criteria: {
          type: 'read_specific',
          pokemonNames: ['Bulbasaur'],
          requiredCount: 1
        },
        category: 'Bronze'
      });

      await updateAchievementProgress(testUser._id, 'read_description', {
        pokemonId: testPokemon._id.toString(),
        pokemonName: testPokemon.name,
        pokemonTypes: testPokemon.types,
        pokemonGeneration: 1
      });

      const user = await User.findById(testUser._id);
      const progress = user.achievementProgress[achievement._id.toString()];
      expect(progress).toBeDefined();
      expect(progress.current).toBe(1);
      expect(user.completedAchievements).toContainEqual(achievement._id);
    });
  });

  describe('Logros por tipo de Pokémon', () => {
    test('Debería actualizar progreso para logros de tipo', async () => {
      const achievement = await Achievement.create({
        name: 'Amigo de la Hierba',
        description: 'Lee 5 Pokémon de tipo Grass',
        criteria: {
          type: 'read_type',
          pokemonTypes: ['Grass'],
          requiredCount: 5
        },
        category: 'Bronze'
      });

      // Simular 5 lecturas de Pokémon tipo Grass
      for (let i = 0; i < 5; i++) {
        await updateAchievementProgress(testUser._id, 'read_description', {
          pokemonId: new mongoose.Types.ObjectId().toString(),
          pokemonName: `GrassPokemon${i}`,
          pokemonTypes: ['Grass'],
          pokemonGeneration: 1
        });
      }

      const user = await User.findById(testUser._id);
      const progress = user.achievementProgress[achievement._id.toString()];
      expect(progress).toBeDefined();
      expect(progress.current).toBe(5);
      expect(user.completedAchievements).toContainEqual(achievement._id);
    });
  });

  describe('Logros de generación', () => {
    test('Debería manejar logros de generación completa', async () => {
      const achievement = await Achievement.create({
        name: 'Maestro de Kanto',
        description: 'Lee todos los Pokémon de la primera generación',
        criteria: {
          type: 'read_generation_complete',
          generation: 1,
          requiredCount: 151
        },
        category: 'Bronze'
      });

      // Simular lectura de todos los Pokémon de Kanto
      for (let i = 1; i <= 151; i++) {
        await updateAchievementProgress(testUser._id, 'read_description', {
          pokemonId: new mongoose.Types.ObjectId().toString(),
          pokemonName: `Pokemon${i}`,
          pokemonTypes: ['Normal'],
          pokemonGeneration: 1
        });
      }

      const user = await User.findById(testUser._id);
      const progress = user.achievementProgress[achievement._id.toString()];
      expect(progress).toBeDefined();
      expect(progress.current).toBe(151);
      expect(user.completedAchievements).toContainEqual(achievement._id);
    });
  });

  describe('Logros especiales', () => {
    test('Debería manejar logros de Pokémon legendarios', async () => {
      const achievement = await Achievement.create({
        name: 'Leyenda Viva',
        description: 'Lee un Pokémon legendario',
        criteria: {
          type: 'read_legendary',
          requiredCount: 1
        },
        category: 'Bronze'
      });

      await updateAchievementProgress(testUser._id, 'read_description', {
        pokemonId: testLegendary._id.toString(),
        pokemonName: testLegendary.name,
        pokemonTypes: testLegendary.types,
        pokemonGeneration: 1,
        isLegendary: true
      });

      const user = await User.findById(testUser._id);
      const progress = user.achievementProgress[achievement._id.toString()];
      expect(progress).toBeDefined();
      expect(progress.current).toBe(1);
      expect(user.completedAchievements).toContainEqual(achievement._id);
    });

    test('Debería manejar logros de favoritos', async () => {
      const achievement = await Achievement.create({
        name: 'Favorito Legendario',
        description: 'Agrega un Pokémon legendario a favoritos',
        criteria: {
          type: 'favorite_legendary',
          requiredCount: 1
        },
        category: 'Bronze'
      });

      await updateAchievementProgress(testUser._id, 'add_favorite', {
        pokemonId: testLegendary._id.toString(),
        pokemonName: testLegendary.name,
        pokemonTypes: testLegendary.types,
        pokemonGeneration: 1,
        isLegendary: true
      });

      const user = await User.findById(testUser._id);
      const progress = user.achievementProgress[achievement._id.toString()];
      expect(progress).toBeDefined();
      expect(progress.current).toBe(1);
      expect(user.completedAchievements).toContainEqual(achievement._id);
    });
  });

  describe('Manejo de errores', () => {
    test('Debería manejar usuario no encontrado', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await updateAchievementProgress('invalid_id', 'read_description', {});
      expect(consoleSpy).toHaveBeenCalledWith('Usuario no encontrado: invalid_id');
    });

    test('Debería manejar tipos de logro no implementados', async () => {
      const achievement = await Achievement.create({
        name: 'Logro No Implementado',
        description: 'Test de tipo no implementado',
        criteria: {
          type: 'read_description',
          requiredCount: 1
        },
        category: 'Bronze'
      });

      const consoleSpy = vi.spyOn(console, 'log');
      await updateAchievementProgress(testUser._id, 'read_description', {});
      expect(consoleSpy).toHaveBeenCalledWith('Tipo de logro no implementado: read_description');
    });
  });

  describe('Prevención de duplicados', () => {
    test('No debería contar el mismo Pokémon dos veces', async () => {
      const achievement = await Achievement.create({
        name: 'Lectura Única',
        description: 'Lee un Pokémon específico',
        criteria: {
          type: 'read_description',
          requiredCount: 1
        },
        category: 'Bronze'
      });

      // Intentar contar el mismo Pokémon dos veces
      await updateAchievementProgress(testUser._id, 'read_description', {
        pokemonId: testPokemon._id.toString(),
        pokemonName: testPokemon.name,
        pokemonTypes: testPokemon.types,
        pokemonGeneration: 1
      });

      await updateAchievementProgress(testUser._id, 'read_description', {
        pokemonId: testPokemon._id.toString(),
        pokemonName: testPokemon.name,
        pokemonTypes: testPokemon.types,
        pokemonGeneration: 1
      });

      const user = await User.findById(testUser._id);
      const progress = user.achievementProgress[achievement._id.toString()];
      expect(progress).toBeDefined();
      expect(progress.current).toBe(1);
    });
  });
}); 