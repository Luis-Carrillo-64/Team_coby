const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const achievements = require('../data/achievements.json');
require('dotenv').config();

async function seedAchievements() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pokedex');
    console.log('Conectado a MongoDB');

    // Limpiar logros existentes
    await Achievement.deleteMany({});
    console.log('Logros existentes eliminados');

    // Insertar nuevos logros
    const achievementsToInsert = achievements.map(a => {
      if (a.criteria && a.criteria.value !== undefined) {
        a.criteria.requiredCount = a.criteria.value;
        delete a.criteria.value;
      }
      // Eliminar el campo 'id' para evitar conflicto con _id de MongoDB
      if (a.id !== undefined) {
        delete a.id;
      }
      return a;
    });
    await Achievement.insertMany(achievementsToInsert);
    console.log('Logros sembrados exitosamente');

    process.exit(0);
  } catch (error) {
    console.error('Error sembrando logros:', error);
    process.exit(1);
  }
}

seedAchievements(); 