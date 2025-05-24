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

// Método para actualizar el progreso de un logro
userSchema.methods.updateAchievementProgress = async function(achievementId, progress, details = {}) {
  const progressKey = achievementId.toString();
  let currentProgress = this.achievementProgress.get(progressKey) || {
    current: 0,
    lastUpdated: Date.now(),
    details: {}
  };

  currentProgress.current = progress;
  currentProgress.lastUpdated = Date.now();
  currentProgress.details = { ...currentProgress.details, ...details };

  this.achievementProgress.set(progressKey, currentProgress);
  return this.save();
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
    details: {}
  };
};

// Método para verificar si un logro está completado
userSchema.methods.hasCompletedAchievement = function(achievementId) {
  const achievementIdStr = achievementId.toString();
  return this.completedAchievements.some(id => id.toString() === achievementIdStr);
};

module.exports = mongoose.model('User', userSchema); 