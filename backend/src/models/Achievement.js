const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Bronce', 'Plata', 'Oro', 'Diamante', 'Platino']
  },
  criteria: {
    type: {
      type: String,
      required: true,
      enum: [
        'read_description',
        'add_favorite',
        'read_type',
        'favorite_gym_leader',
        'read_baby',
        'read_generation',
        'check_stat',
        'read_legendary',
        'favorite_support',
        'read_specific',
        'read_legendary_type',
        'read_move',
        'read_stone_evolution',
        'read_alola_legendary',
        'read_kanto_special',
        'check_all_stats',
        'read_cave',
        'read_ultra_beast',
        'read_final_evolution',
        'check_moves',
        'read_regional_forms',
        'read_generation_complete',
        'check_legendary_stats',
        'complete_all',
        'profile_complete',
        'use_filter',
        'favorite_legendary',
        'read_breeding',
        'read_evolution',
        'read_anime_classic'
      ]
    },
    requiredCount: {
      type: Number,
      required: true,
      min: 1
    },
    // Campos específicos para validación
    pokemonIds: {
      type: [Number],
      default: []
    },
    pokemonType: {
      type: String,
      enum: ['fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy', 'normal']
    },
    generation: {
      type: Number,
      min: 1,
      max: 9
    },
    pokemonRange: {
      type: String,
      validate: {
        validator: function(v) {
          return /^\d+-\d+$/.test(v);
        },
        message: props => `${props.value} no es un rango válido (formato: "1-151")`
      }
    },
    stat: {
      type: String,
      enum: ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed']
    },
    isLegendary: {
      type: Boolean
    },
    isBaby: {
      type: Boolean
    },
    canBreed: {
      type: Boolean
    },
    evolvesWithStone: {
      type: Boolean
    },
    isSupport: {
      type: Boolean
    },
    isGymLeader: {
      type: Boolean
    },
    hasMultipleEvolutions: {
      type: Boolean
    }
  },
  details: {
    type: {
      type: String,
      enum: ['fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy', 'normal']
    },
    generation: {
      type: Number,
      min: 1,
      max: 9
    },
    isLegendary: {
      type: Boolean
    },
    stat: {
      type: String,
      enum: ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed']
    },
    statValue: {
      type: Number,
      min: 0,
      max: 255
    }
  },
  reward: {
    type: String,
    trim: true
  },
  hidden: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: 'default-achievement.png'
  }
}, {
  timestamps: true
});

// Método para validar si un Pokémon cumple con los criterios del logro
achievementSchema.methods.validatePokemon = function(pokemon) {
  const { criteria } = this;
  let cumple = true;

  // Validar lista específica de Pokémon
  if (criteria.pokemonIds && criteria.pokemonIds.length > 0) {
    if (!criteria.pokemonIds.includes(pokemon.number)) {
      cumple = false;
    }
  }

  // Validar tipo de Pokémon
  if (criteria.pokemonType) {
    const pokemonTypes = Array.isArray(pokemon.types) ? pokemon.types : [pokemon.type];
    if (!pokemonTypes.includes(criteria.pokemonType)) {
      cumple = false;
    }
  }

  // Validar generación
  if (criteria.generation) {
    const pokemonGeneration = Math.ceil(pokemon.number / 151);
    if (pokemonGeneration !== criteria.generation) {
      cumple = false;
    }
  }

  // Validar rango de Pokémon
  if (criteria.pokemonRange) {
    const [min, max] = criteria.pokemonRange.split('-').map(Number);
    if (pokemon.number < min || pokemon.number > max) {
      cumple = false;
    }
  }

  // Validar características específicas
  if (criteria.isLegendary !== undefined && criteria.isLegendary !== pokemon.isLegendary) {
    cumple = false;
  }

  if (criteria.isBaby !== undefined && criteria.isBaby !== pokemon.isBaby) {
    cumple = false;
  }

  if (criteria.canBreed !== undefined && criteria.canBreed !== pokemon.canBreed) {
    cumple = false;
  }

  if (criteria.evolvesWithStone !== undefined && criteria.evolvesWithStone !== pokemon.evolvesWithStone) {
    cumple = false;
  }

  if (criteria.isSupport !== undefined && criteria.isSupport !== pokemon.isSupport) {
    cumple = false;
  }

  if (criteria.isGymLeader !== undefined && criteria.isGymLeader !== pokemon.isGymLeader) {
    cumple = false;
  }

  if (criteria.hasMultipleEvolutions !== undefined && criteria.hasMultipleEvolutions !== pokemon.hasMultipleEvolutions) {
    cumple = false;
  }

  return cumple;
};

module.exports = mongoose.model('Achievement', achievementSchema); 