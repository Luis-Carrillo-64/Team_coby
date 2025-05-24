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
  reward: { // Optional reward associated with the achievement
    type: String,
    trim: true
  },
  hidden: { // If the achievement is hidden until unlocked
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: 'default-achievement.png'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('Achievement', achievementSchema); 