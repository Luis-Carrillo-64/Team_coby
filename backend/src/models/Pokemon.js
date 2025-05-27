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
  },
  isLegendary: {
    type: Boolean,
    default: false
  },
  isBaby: {
    type: Boolean,
    default: false
  },
  canBreed: {
    type: Boolean,
    default: true
  },
  evolvesWithStone: {
    type: Boolean,
    default: false
  },
  isSupport: {
    type: Boolean,
    default: false
  },
  moves: [{
    name: String,
    type: String,
    power: Number,
    accuracy: Number,
    pp: Number
  }],
  evolution: {
    preEvolution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pokemon'
    },
    nextEvolution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pokemon'
    },
    evolutionMethod: String
  },
  breeding: {
    eggGroups: [String],
    genderRatio: {
      male: Number,
      female: Number
    },
    eggCycles: Number
  }
}, {
  timestamps: true
});

pokemonSchema.index({ name: 1 });
pokemonSchema.index({ number: 1 });
pokemonSchema.index({ types: 1 });
pokemonSchema.index({ isLegendary: 1 });
pokemonSchema.index({ isBaby: 1 });

pokemonSchema.virtual('generation').get(function() {
  if (this.number <= 151) return 1;
  if (this.number <= 251) return 2;
  if (this.number <= 386) return 3;
  if (this.number <= 493) return 4;
  if (this.number <= 649) return 5;
  if (this.number <= 721) return 6;
  if (this.number <= 809) return 7;
  if (this.number <= 898) return 8;
  return 9;
});

pokemonSchema.methods.isStarter = function() {
  const starterNumbers = [1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393];
  return starterNumbers.includes(this.number);
};

pokemonSchema.methods.isMythical = function() {
  const mythicalNumbers = [151, 251, 385, 493, 648, 719, 801, 890];
  return mythicalNumbers.includes(this.number);
};

pokemonSchema.statics.getAllTypes = async function() {
  return this.distinct('types');
};

pokemonSchema.statics.getByGeneration = async function(generation) {
  const ranges = {
    1: { min: 1, max: 151 },
    2: { min: 152, max: 251 },
    3: { min: 252, max: 386 },
    4: { min: 387, max: 493 },
    5: { min: 494, max: 649 },
    6: { min: 650, max: 721 },
    7: { min: 722, max: 809 },
    8: { min: 810, max: 898 },
    9: { min: 899, max: 1010 }
  };
  
  const range = ranges[generation];
  if (!range) throw new Error('Generación no válida');
  
  return this.find({
    number: { $gte: range.min, $lte: range.max }
  });
};

module.exports = mongoose.model('Pokemon', pokemonSchema); 