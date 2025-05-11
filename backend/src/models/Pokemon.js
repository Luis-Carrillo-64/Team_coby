const mongoose = require('mongoose');

const pokemonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  number: {
    type: Number,
    required: true,
    unique: true
  },
  types: [{
    type: String,
    required: true
  }],
  description: {
    type: String,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  abilities: [{
    type: String,
    required: true
  }],
  stats: {
    hp: Number,
    attack: Number,
    defense: Number,
    specialAttack: Number,
    specialDefense: Number,
    speed: Number
  },
  image: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Pokemon = mongoose.model('Pokemon', pokemonSchema);

module.exports = Pokemon; 