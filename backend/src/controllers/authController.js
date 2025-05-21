const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const TOKEN_EXPIRATION = '15m'; // Token expira en 15 minutos
const REFRESH_TOKEN_EXPIRATION = '7d'; // Refresh token expira en 7 días

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      username: user.username,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      type: 'refresh'
    },
    process.env.JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRATION }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return next(new AppError('Usuario o email ya existe', 400));
    }

    // Crear nuevo usuario
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generar token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Setear cookie segura
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutos
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ username });
    if (!user) {
      return next(new AppError('Credenciales inválidas', 401));
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return next(new AppError('Credenciales inválidas', 401));
    }

    // Generar token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Setear cookie segura
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutos
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return next(new AppError('No refresh token provided', 401));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return next(new AppError('Invalid token type', 401));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutos
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.json({
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired refresh token', 401));
    }
    next(error);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

exports.verifyToken = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new AppError('Not authenticated', 401));
    }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return next(new AppError('User no longer exists', 401));
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const { theme } = req.body;
    if (!theme || !['light', 'dark'].includes(theme)) {
      return next(new AppError('Tema inválido', 400));
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 'preferences.theme': theme },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// FAVORITOS
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }
    res.json({ favorites: user.favorites || [] });
  } catch (error) {
    next(error);
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const { pokemonName } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }
    
    if (!user.favorites.includes(pokemonName)) {
      user.favorites.push(pokemonName);
      await user.save();
    }
    res.json({ favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const { pokemonName } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }
    
    user.favorites = user.favorites.filter(name => name !== pokemonName);
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Actualizar usuario
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;
    
    if (role && !['user', 'admin'].includes(role)) {
      return next(new AppError('Rol inválido', 400));
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { username, email, role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// ADMIN: Eliminar usuario
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Crear usuario
exports.createUser = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    
    if (role && !['user', 'admin'].includes(role)) {
      return next(new AppError('Rol inválido', 400));
    }
    
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return next(new AppError('Usuario o email ya existe', 400));
    }
    
    const user = new User({ username, email, password, role });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}; 