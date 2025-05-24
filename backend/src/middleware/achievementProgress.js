const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Pokemon = require('../models/Pokemon');
const { achievementController } = require('../controllers/achievementController');

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

// Middleware para actualizar el progreso de logros
const updateAchievementProgress = async (userId, actionType, details = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log(`Usuario no encontrado: ${userId}`);
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
      let cumple = true;

      // Verificar criterios específicos
      if (criteria.pokemonIds && Array.isArray(criteria.pokemonIds)) {
        if (!details.pokemonId || !criteria.pokemonIds.map(String).includes(String(details.pokemonId))) {
          cumple = false;
        }
      }

      if (criteria.generation && details.pokemonGeneration) {
        if (criteria.generation !== details.pokemonGeneration) {
          cumple = false;
        }
      }

      if (criteria.typeValue && details.pokemonType) {
        if (criteria.typeValue !== details.pokemonType) {
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

        if (newProgress >= (criteria.requiredCount || 1)) {
          await user.completeAchievement(achievement._id);
        }
      }
    }
  } catch (error) {
    console.error('Error updating achievement progress:', error);
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
  if (!req.user?.id) {
    console.log('trackPokemonVisit: No hay usuario autenticado');
    return next();
  }

  try {
    const pokemonId = req.params.id;
    console.log(`trackPokemonVisit: Procesando visita de Pokémon ${pokemonId} por usuario ${req.user.id}`);
    
    const pokemon = await Pokemon.findById(pokemonId);
    if (!pokemon) {
      console.log(`trackPokemonVisit: Pokémon ${pokemonId} no encontrado`);
      return next();
    }

    const details = {
      pokemonId: pokemon._id.toString(),
      pokemonName: pokemon.name,
      pokemonTypes: pokemon.types || [pokemon.type],
      pokemonGeneration: Math.ceil(pokemon.number / 151),
      isLegendary: pokemon.isLegendary || false,
      isBaby: pokemon.isBaby || false,
      canBreed: pokemon.canBreed || false,
      evolvesWithStone: pokemon.evolvesWithStone || false,
      isSupport: pokemon.isSupport || false
    };

    console.log(`trackPokemonVisit: Actualizando progreso para usuario ${req.user.id} con detalles:`, details);
    await updateAchievementProgress(req.user.id, 'read_description', details);
    console.log('trackPokemonVisit: Progreso actualizado exitosamente');
  } catch (error) {
    console.error('Error en trackPokemonVisit:', error);
  }
  next();
};

// Middleware para agregar a favoritos
const trackFavoriteAdd = async (req, res, next) => {
  if (!req.user?.id) {
    console.log('trackFavoriteAdd: No hay usuario autenticado');
    return next();
  }

  try {
    const pokemonId = req.body.pokemonId || req.params.id;
    console.log(`trackFavoriteAdd: Procesando favorito de Pokémon ${pokemonId} por usuario ${req.user.id}`);
    
    const pokemon = await Pokemon.findById(pokemonId);
    if (!pokemon) {
      console.log(`trackFavoriteAdd: Pokémon ${pokemonId} no encontrado`);
      return next();
    }

    const details = {
      pokemonId: pokemon._id.toString(),
      pokemonName: pokemon.name,
      pokemonTypes: pokemon.types || [pokemon.type],
      pokemonGeneration: Math.ceil(pokemon.number / 151),
      isLegendary: pokemon.isLegendary || false,
      isBaby: pokemon.isBaby || false,
      isSupport: pokemon.isSupport || false
    };

    console.log(`trackFavoriteAdd: Actualizando progreso para usuario ${req.user.id} con detalles:`, details);
    await updateAchievementProgress(req.user.id, 'add_favorite', details);
    console.log('trackFavoriteAdd: Progreso actualizado exitosamente');
  } catch (error) {
    console.error('Error en trackFavoriteAdd:', error);
  }
  next();
};

module.exports = {
  updateAchievementProgress,
  handleAchievementEvent,
  trackPokemonVisit
}; 