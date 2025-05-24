const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const mongoose = require('mongoose');

// Obtener todos los logros
exports.getAllAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find();
    res.json(achievements);
  } catch (error) {
    next(error);
  }
};

// Helper para sincronizar logros completados según progreso actual
async function syncCompletedAchievements(user, allAchievements) {
  let modified = false;
  const completedSet = new Set(user.completedAchievements.map(id => id.toString()));

  for (const achievement of allAchievements) {
    const idStr = achievement._id.toString();
    const progress = user.getAchievementProgress(achievement._id);
    const current = progress.current || 0;
    const requiredCount = achievement.criteria.requiredCount || 1;

    if (current >= requiredCount && !completedSet.has(idStr)) {
      await user.completeAchievement(achievement._id);
      completedSet.add(idStr);
      modified = true;
    }
  }

  return modified;
}

// Obtener logros de un usuario y su progreso
exports.getUserAchievements = async (req, res, next) => {
  try {
    console.log(`Fetching achievements and progress for user: ${req.user.id}`);
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log(`User not found when fetching achievements: ${req.user.id}`);
      return next(new AppError('Usuario no encontrado', 404));
    }

    const allAchievements = await Achievement.find();
    await syncCompletedAchievements(user, allAchievements);

    // Preparar datos para enviar
    const completedAchievementsToSend = user.completedAchievements.map(id => id.toString());
    const achievementProgressToSend = {};

    // Convertir Map a objeto plano
    for (const [key, value] of user.achievementProgress.entries()) {
      achievementProgressToSend[key] = {
        current: value.current || 0,
        lastUpdated: value.lastUpdated,
        details: value.details || {}
      };
    }

    res.status(200).json({
      completedAchievements: completedAchievementsToSend,
      achievementProgress: achievementProgressToSend,
      allAchievements: allAchievements
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    next(new AppError('Error al obtener logros del usuario', 500));
  }
};

// (Admin) Crear un nuevo logro
exports.createAchievement = async (req, res, next) => {
  try {
    const achievement = new Achievement(req.body);
    await achievement.save();
    res.status(201).json(achievement);
  } catch (error) {
    if (error.name === 'ValidationError' || (error.code === 11000 && error.keyPattern && error.keyPattern.name === 1)) {
      return next(new AppError(error.message, 400));
    }
    next(error);
  }
};

// (Admin) Actualizar un logro
exports.updateAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!achievement) {
      return next(new AppError('Logro no encontrado', 404));
    }

    res.json(achievement);
  } catch (error) {
    if (error.name === 'ValidationError' || (error.code === 11000 && error.keyPattern && error.keyPattern.name === 1)) {
      return next(new AppError(error.message, 400));
    }
    next(error);
  }
};

// (Admin) Eliminar un logro
exports.deleteAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);

    if (!achievement) {
      return next(new AppError('Logro no encontrado', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Función para actualizar el progreso del logro de un usuario
exports.updateAchievementProgress = async (userId, actionType, details = {}) => {
  try {
    console.log(`Actualizando progreso para usuario ${userId}, acción: ${actionType}, detalles:`, details);
    const user = await User.findById(userId);
    if (!user) {
      console.error('Usuario no encontrado:', userId);
      return;
    }

    const achievements = await Achievement.find({ 'criteria.type': actionType });
    console.log(`Logros encontrados para acción ${actionType}:`, achievements.length);

    for (const achievement of achievements) {
      if (user.hasCompletedAchievement(achievement._id)) {
        continue;
      }

      const progress = user.getAchievementProgress(achievement._id);
      let cumple = true;

      // Verificar criterios específicos
      if (achievement.criteria.pokemonIds && Array.isArray(achievement.criteria.pokemonIds)) {
        if (!details.pokemonId || !achievement.criteria.pokemonIds.map(String).includes(String(details.pokemonId))) {
          cumple = false;
        }
      }

      if (achievement.criteria.generation && details.pokemonGeneration) {
        if (achievement.criteria.generation !== details.pokemonGeneration) {
          cumple = false;
        }
      }

      if (achievement.criteria.typeValue && details.pokemonType) {
        if (achievement.criteria.typeValue !== details.pokemonType) {
          cumple = false;
        }
      }

      if (achievement.details && achievement.details.pokemonName && details.pokemonName) {
        if (achievement.details.pokemonName !== details.pokemonName) {
          cumple = false;
        }
      }

      if (cumple) {
        const newProgress = progress.current + 1;
        await user.updateAchievementProgress(achievement._id, newProgress, details);

        if (newProgress >= (achievement.criteria.requiredCount || 1)) {
          await user.completeAchievement(achievement._id);
        }
      }
    }
  } catch (error) {
    console.error('Error updating achievement progress:', error);
    throw error;
  }
}; 