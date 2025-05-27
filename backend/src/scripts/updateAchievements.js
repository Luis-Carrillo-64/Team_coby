const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const fs = require('fs');
const path = require('path');

// Configuración de la conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pokedex', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Función para actualizar los logros
async function updateAchievements() {
  try {
    // Leer el archivo JSON con los logros actualizados
    const achievementsPath = path.join(__dirname, '../data/achievements.json');
    const achievementsData = JSON.parse(fs.readFileSync(achievementsPath, 'utf8'));

    console.log('Iniciando actualización de logros...');

    // Actualizar cada logro
    for (const achievementData of achievementsData) {
      const { id, name, description, category, criteria, hidden, icon } = achievementData;

      // Buscar el logro existente por nombre
      const existingAchievement = await Achievement.findOne({ name });

      if (existingAchievement) {
        // Actualizar el logro existente
        existingAchievement.description = description;
        existingAchievement.category = category;
        existingAchievement.criteria = criteria;
        existingAchievement.hidden = hidden;
        existingAchievement.icon = icon;

        await existingAchievement.save();
        console.log(`Logro actualizado: ${name}`);
      } else {
        // Crear nuevo logro
        const newAchievement = new Achievement({
          name,
          description,
          category,
          criteria,
          hidden,
          icon
        });

        await newAchievement.save();
        console.log(`Nuevo logro creado: ${name}`);
      }
    }

    console.log('Actualización de logros completada exitosamente');
  } catch (error) {
    console.error('Error al actualizar los logros:', error);
  } finally {
    // Cerrar la conexión a MongoDB
    await mongoose.connection.close();
  }
}

// Ejecutar la actualización
updateAchievements(); 