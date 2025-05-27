const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Pokemon = require('../models/Pokemon');
const { achievementController } = require('../controllers/achievementController');
const { AppError } = require('./errorHandler');
const { processAchievement } = require('../controllers/achievementController');

// Función auxiliar para obtener el total de Pokémon por generación
const getTotalPokemonByGeneration = (generation) => {
  const totals = {
    1: 151,  // Kanto
    2: 251,  // Johto
    3: 386,  // Hoenn
    4: 493,  // Sinnoh
    5: 649,  // Unova
    6: 721,  // Kalos
    7: 809,  // Alola
    8: 898,  // Galar
    9: 1010  // Paldea
  };
  return totals[generation] || 0;
};

// Función auxiliar para validar tipos de Pokémon
const validatePokemonType = (pokemonTypes, targetType) => {
  if (!Array.isArray(pokemonTypes)) {
    pokemonTypes = [pokemonTypes];
  }
  return pokemonTypes.includes(targetType);
};

// Función auxiliar para validar criterios específicos
const validateSpecificCriteria = (achievement, details) => {
  const { criteria } = achievement;
  let cumple = true;

  // Validar tipo de Pokémon (considerando tipos múltiples)
  if (criteria.typeValue && details.pokemonTypes) {
    if (!validatePokemonType(details.pokemonTypes, criteria.typeValue)) {
      cumple = false;
    }
  }

  // Validar generación
  if (criteria.generation && details.pokemonGeneration) {
    if (criteria.generation !== details.pokemonGeneration) {
      cumple = false;
    }
  }

  // Validar Pokémon específicos
  if (criteria.targetPokemon && Array.isArray(criteria.targetPokemon)) {
    if (!details.pokemonName || !criteria.targetPokemon.includes(details.pokemonName)) {
      cumple = false;
    }
  }

  // Validar si es legendario
  if (criteria.isLegendary !== undefined && details.isLegendary !== undefined) {
    if (criteria.isLegendary !== details.isLegendary) {
      cumple = false;
    }
  }

  // Validar estadísticas específicas
  if (criteria.stat && details.statType) {
    if (criteria.stat !== details.statType) {
      cumple = false;
    }
  }

  return cumple;
};

// Middleware para actualizar el progreso de logros
const updateAchievementProgress = async (userId, actionType, details = {}) => {
  try {
    console.log(`[Achievement Progress] Actualizando progreso para usuario ${userId}, acción: ${actionType}`);
    console.log('[BACKEND][updateAchievementProgress] Recibido details:', details);

    const user = await User.findById(userId);
    if (!user) {
      console.error('[Achievement Progress] Usuario no encontrado:', userId);
      return;
    }

    // Obtener todos los logros activos para este tipo de acción
    const achievements = await Achievement.find({
      'criteria.type': actionType,
      _id: { $nin: user.completedAchievements }
    });

    for (const achievement of achievements) {
      const { criteria } = achievement;
      const progress = user.getAchievementProgress(achievement._id);

      // Verificar si el elemento ya fue contado
      if (details.pokemonId && user.hasCountedItem(achievement._id, details.pokemonId)) {
        continue;
      }

      // Validar criterios específicos según el tipo de logro
      let cumple = true;

      switch (actionType) {
        case 'read_description':
        case 'read_type':
        case 'read_generation':
        case 'read_specific':
        case 'read_baby':
        case 'read_legendary':
        case 'read_breeding':
        case 'read_evolution':
          if (details.pokemonId) {
            const pokemon = await Pokemon.findById(details.pokemonId);
            if (pokemon) {
              cumple = achievement.validatePokemon(pokemon);
            }
          }
          break;

        case 'add_favorite':
          // No requiere validación adicional
          break;

        case 'favorite_gym_leader':
          if (details.pokemonId) {
            const pokemon = await Pokemon.findById(details.pokemonId);
            if (pokemon) {
              cumple = achievement.validatePokemon(pokemon);
            }
          }
          break;

        case 'favorite_legendary':
          cumple = details.isLegendary === true;
          break;

        case 'check_stat':
          if (criteria.stat && details.statType) {
            cumple = criteria.stat === details.statType;
          }
          break;

        case 'use_filter':
          // No requiere validación adicional
          break;

        case 'profile_complete':
          // No requiere validación adicional
          break;
      }

      if (cumple) {
        const newProgress = progress.current + 1;
        await user.updateAchievementProgress(achievement._id, newProgress, details);

        if (newProgress >= (criteria.requiredCount || 1)) {
          await user.completeAchievement(achievement._id);
          console.log(`[Achievement Progress] Logro completado: ${achievement.name}`);
        }
      }
    }
  } catch (error) {
    console.error('[Achievement Progress] Error:', error);
    throw error;
  }
};

// Middleware para manejar eventos de logros
const handleAchievementEvent = async (req, res, next) => {
  try {
    const { actionType, details } = req.body;
    if (!actionType) {
      return next(new AppError('Tipo de acción no especificado', 400));
    }

    await updateAchievementProgress(req.user.id, actionType, details);
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para visitar Pokémon
const trackPokemonVisit = async (req, res, next) => {
  if (!req.user?.id) return next();
  try {
    const pokemonId = req.params.id;
    const pokemon = await Pokemon.findById(pokemonId);
    if (!pokemon) return next();
    const details = {
      pokemonId: pokemon._id.toString(),
      pokemonName: pokemon.name,
      pokemonTypes: pokemon.types || [pokemon.type],
      pokemonGeneration: Math.ceil(pokemon.number / 151),
      isLegendary: pokemon.isLegendary || false,
      isBaby: pokemon.isBaby || false,
      canBreed: pokemon.canBreed || false,
      evolvesWithStone: pokemon.evolvesWithStone || false,
      isSupport: pokemon.isSupport || false,
      isGymLeader: pokemon.isGymLeader || false,
      hasMultipleEvolutions: pokemon.hasMultipleEvolutions || false
    };
    await processAchievement(req.user.id, 'read_description', details);
  } catch (error) {
    console.error('[Achievement Progress] Error en trackPokemonVisit:', error);
  }
  next();
};

// Middleware para agregar a favoritos
const trackFavoriteAdd = async (req, res, next) => {
  if (!req.user?.id) return next();
  try {
    const pokemonId = req.body.pokemonId || req.params.id;
    const pokemon = await Pokemon.findById(pokemonId);
    if (!pokemon) return next();
    const details = {
      pokemonId: pokemon._id.toString(),
      pokemonName: pokemon.name,
      pokemonTypes: pokemon.types || [pokemon.type],
      pokemonGeneration: Math.ceil(pokemon.number / 151),
      isLegendary: pokemon.isLegendary || false,
      isBaby: pokemon.isBaby || false,
      isSupport: pokemon.isSupport || false,
      isGymLeader: pokemon.isGymLeader || false,
      hasMultipleEvolutions: pokemon.hasMultipleEvolutions || false
    };
    await processAchievement(req.user.id, 'add_favorite', details);
  } catch (error) {
    console.error('[Achievement Progress] Error en trackFavoriteAdd:', error);
  }
  next();
};

module.exports = {
  updateAchievementProgress,
  handleAchievementEvent,
  trackPokemonVisit,
  trackFavoriteAdd
}; 