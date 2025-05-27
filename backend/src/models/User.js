const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  favorites: [{
    type: String,
    default: []
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  // Campos para logros
  completedAchievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  achievementProgress: {
    type: Map,
    of: {
      current: {
        type: Number,
        default: 0
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      },
      details: {
        type: Object,
        default: {}
      },
      // Nuevo campo para almacenar elementos únicos por tipo de logro
      uniqueItems: {
        type: [String],
        default: []
      }
    },
    default: new Map()
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método atómico para actualizar el progreso de un logro evitando duplicados
userSchema.methods.updateAchievementProgressAtomic = async function(achievementId, details = {}) {
  const progressKey = `achievementProgress.${achievementId}`;
  const uniqueItem = details.pokemonId || null;

  let filter, update;
  if (uniqueItem) {
    filter = { _id: this._id, [`${progressKey}.uniqueItems`]: { $ne: uniqueItem } };
    update = {
      $set: {
        [`${progressKey}.lastUpdated`]: new Date(),
        [`${progressKey}.details`]: details
      },
      $addToSet: { [`${progressKey}.uniqueItems`]: uniqueItem },
      $inc: { [`${progressKey}.current`]: 1 }
    };
  } else {
    // Solo permite incrementar si current es 0 (acción única)
    filter = { _id: this._id, $or: [ { [`${progressKey}.current`]: { $exists: false } }, { [`${progressKey}.current`]: 0 } ] };
    update = {
      $set: {
        [`${progressKey}.lastUpdated`]: new Date(),
        [`${progressKey}.details`]: details
      },
      $inc: { [`${progressKey}.current`]: 1 }
    };
  }

  return this.model('User').findOneAndUpdate(filter, update, { new: true });
};

// Método para marcar un logro como completado
userSchema.methods.completeAchievement = async function(achievementId) {
  const achievementIdStr = achievementId.toString();
  if (!this.completedAchievements.some(id => id.toString() === achievementIdStr)) {
    this.completedAchievements.push(achievementId);
    return this.save();
  }
  return this;
};

// Método para obtener el progreso de un logro
userSchema.methods.getAchievementProgress = function(achievementId) {
  const progressKey = achievementId.toString();
  return this.achievementProgress.get(progressKey) || {
    current: 0,
    lastUpdated: Date.now(),
    details: {},
    uniqueItems: []
  };
};

// Método para verificar si un logro está completado
userSchema.methods.hasCompletedAchievement = function(achievementId) {
  const achievementIdStr = achievementId.toString();
  return this.completedAchievements.some(id => id.toString() === achievementIdStr);
};

// Método para verificar si un elemento ya fue contado para un logro
userSchema.methods.hasCountedItem = function(achievementId, itemId) {
  const progress = this.getAchievementProgress(achievementId);
  return progress.uniqueItems.includes(itemId);
};

module.exports = mongoose.model('User', userSchema); 