const Achievement = require('../models/Achievement');
const User = require('../models/User');
const Pokemon = require('../models/Pokemon');
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

// Servicio centralizado para procesar logros
exports.processAchievement = async (userId, actionType, details = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');
    const achievements = await Achievement.find({ 'criteria.type': actionType });
    for (const achievement of achievements) {
      if (user.hasCompletedAchievement(achievement._id)) continue;
      if (details.pokemonId && user.hasCountedItem(achievement._id, details.pokemonId)) continue;
      let cumple = false;
      if (details.pokemonId) {
        const pokemon = await Pokemon.findById(details.pokemonId);
        cumple = achievement.validatePokemon(pokemon);
      } else {
        cumple = true;
      }
      if (cumple) {
        const updatedUser = await user.updateAchievementProgressAtomic(achievement._id, details);
        const progress = updatedUser.getAchievementProgress(achievement._id);
        if (progress.current >= achievement.criteria.requiredCount) {
          await updatedUser.completeAchievement(achievement._id);
        }
      }
    }
  } catch (error) {
    console.error('[Achievement Progress] Error:', error);
    throw error;
  }
};

// Endpoint para obtener logros y progreso
exports.getUserAchievements = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('Usuario no encontrado', 404));
    const allAchievements = await Achievement.find();
    const completedAchievementsToSend = user.completedAchievements.map(id => id.toString());
    const achievementProgressToSend = {};
    for (const [key, value] of user.achievementProgress.entries()) {
      achievementProgressToSend[key] = {
        current: value.current || 0,
        lastUpdated: value.lastUpdated,
        details: value.details || {},
        uniqueItems: value.uniqueItems || []
      };
    }
    res.status(200).json({
      completedAchievements: completedAchievementsToSend,
      achievementProgress: achievementProgressToSend,
      allAchievements: allAchievements
    });
  } catch (error) {
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