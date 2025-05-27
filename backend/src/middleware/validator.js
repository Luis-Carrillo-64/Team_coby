const { AppError } = require('./errorHandler');

const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return next(new AppError('Por favor proporciona usuario y contraseña', 400));
  }
  
  if (typeof username !== 'string' || typeof password !== 'string') {
    return next(new AppError('Usuario y contraseña deben ser texto', 400));
  }
  
  if (username.length < 3) {
    return next(new AppError('El usuario debe tener al menos 3 caracteres', 400));
  }
  
  if (password.length < 6) {
    return next(new AppError('La contraseña debe tener al menos 6 caracteres', 400));
  }
  
  next();
};

const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return next(new AppError('Por favor proporciona todos los campos requeridos', 400));
  }
  
  if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return next(new AppError('Todos los campos deben ser texto', 400));
  }
  
  if (username.length < 3) {
    return next(new AppError('El usuario debe tener al menos 3 caracteres', 400));
  }
  
  if (password.length < 6) {
    return next(new AppError('La contraseña debe tener al menos 6 caracteres', 400));
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Por favor proporciona un email válido', 400));
  }
  
  next();
};

const validateFavorite = (req, res, next) => {
  const { pokemonName } = req.body;
  
  if (!pokemonName) {
    return next(new AppError('Por favor proporciona el nombre del Pokémon', 400));
  }
  
  if (typeof pokemonName !== 'string') {
    return next(new AppError('El nombre del Pokémon debe ser texto', 400));
  }
  
  next();
};

module.exports = {
  validateLogin,
  validateRegister,
  validateFavorite
}; 