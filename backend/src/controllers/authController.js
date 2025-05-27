const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const Achievement = require('../models/Achievement');
const { updateAchievementProgress } = require('./achievementController'); // Importamos la función
const Pokemon = require('../models/Pokemon');

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

// Función helper para configurar cookies
const setCookie = (res, name, value, options = {}) => {
  const isDev = process.env.NODE_ENV !== 'production';
  res.cookie(name, value, {
    httpOnly: true,
    secure: !isDev, // false en desarrollo, true en producción
    sameSite: isDev ? 'lax' : 'none', // 'lax' en desarrollo, 'none' en producción con HTTPS
    maxAge: options.maxAge || (name === 'token' ? 15 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000),
    path: '/',
    ...options
  });
};

// Helper para limpiar cookies de autenticación de forma consistente
const clearAuthCookies = (res) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const cookieOptions = { path: '/', httpOnly: true, secure: !isDev, sameSite: isDev ? 'lax' : 'none' };
  res.clearCookie('token', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
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

    // Llamar a updateAchievementProgress después del registro exitoso
    await updateAchievementProgress(user._id, 'profile_complete');

    // Generar token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Setear cookies usando la función helper
    setCookie(res, 'token', token);
    setCookie(res, 'refreshToken', refreshToken);

    res.status(201).json({
      token,
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
      console.log(`Intento de login fallido para usuario: ${username}. Usuario no encontrado.`); // Log
      return next(new AppError('Credenciales inválidas', 401));
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
       console.log(`Intento de login fallido para usuario: ${username}. Contraseña incorrecta.`); // Log
      return next(new AppError('Credenciales inválidas', 401));
    }

    console.log(`Login exitoso para usuario: ${username} (${user._id}).`); // Log de login exitoso

    // Llamar a updateAchievementProgress después del inicio de sesión exitoso
    console.log('Attempting to update achievement progress for profile_complete on login...'); // Log de inicio
    try {
      // Pasamos el ID del usuario al llamar a la función
      console.log(`Llamando a updateAchievementProgress para usuario ${user._id} con criterio 'profile_complete'.`); // Log antes de llamar
      await updateAchievementProgress(user._id, 'profile_complete');
      console.log('Achievement progress updated successfully on login.'); // Log de éxito
    } catch (achievementError) {
      console.error('Error updating achievement progress on login:', achievementError); // Log de error
      // Decide if you want to halt login here or let it continue despite achievement error
      // For now, we'll let it continue to see if it was the cause of the login failure
    }

    // Generar token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Setear cookies usando la función helper
    setCookie(res, 'token', token);
    setCookie(res, 'refreshToken', refreshToken);

    // Enviamos la respuesta DESPUÉS de intentar actualizar el logro
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Error general en la función login:', error); // Log para errores generales del login
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    console.log('Cookies recibidas en refreshToken:', req.cookies);
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Refresh token inválido o expirado' });
    }
    if (decoded.type !== 'refresh') {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Tipo de token inválido' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Usuario no encontrado para refresh token' });
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    setCookie(res, 'token', newToken);
    setCookie(res, 'refreshToken', newRefreshToken);
    console.log('Refresh token exitoso, nuevos tokens enviados');
    res.json({
      token: newToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    clearAuthCookies(res);
    console.error('Error en refreshToken:', error);
    return res.status(401).json({ message: 'Error interno en refresh token' });
  }
};

exports.logout = (req, res) => {
  clearAuthCookies(res);
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

      // Obtener los detalles del Pokémon para los logros
      const pokemon = await Pokemon.findOne({ name: pokemonName });
      if (pokemon) {
        const achievementDetails = {
          pokemonName: pokemon.name,
          pokemonId: pokemon._id,
          pokemonType: pokemon.types[0],
          pokemonTypes: pokemon.types,
          pokemonGeneration: Math.ceil(pokemon.number / 151),
          isLegendary: pokemon.isLegendary || false,
          stats: pokemon.stats
        };

        // Actualizar progreso para añadir favorito
        console.log(`Calling updateAchievementProgress for add_favorite with pokemon: ${pokemonName}`);
        await updateAchievementProgress(user._id, 'add_favorite', achievementDetails);

        // Si el Pokémon es de un tipo específico, actualizar ese logro
        for (const type of pokemon.types) {
          await updateAchievementProgress(user._id, 'add_favorite', {
            ...achievementDetails,
            pokemonType: type
          });
        }
        console.log('updateAchievementProgress called for add_favorite.');
      }
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

// Obtener logros del usuario logueado
exports.getMeAchievements = async (req, res, next) => {
  try {
    // El middleware `protect` ya ha añadido el usuario a `req.user`
    const userId = req.user.id;

    const user = await User.findById(userId).select('completedAchievements achievementProgress');
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }

    // Obtener todos los logros definidos en la base de datos
    const allAchievements = await Achievement.find();

    res.status(200).json({
      completedAchievements: user.completedAchievements || [],
      achievementProgress: user.achievementProgress || {},
      allAchievements: allAchievements,
    });

  } catch (error) {
    console.error('Error fetching user achievements:', error);
    next(new AppError('Error al obtener logros del usuario', 500));
  }
}; 