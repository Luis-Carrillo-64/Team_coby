require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { logger, limiter, requestLogger, helmetConfig } = require('./src/config/security');
const { errorHandler } = require('./src/middleware/errorHandler');
const noCache = require('./src/middleware/noCache');
// const { validateLogin, validateRegister, validateFavorite } = require('./src/middleware/validator'); // No importamos todos los validadores aquí

const authRoutes = require('./src/routes/auth');
const pokemonRoutes = require('./src/routes/pokemon');
const achievementRoutes = require('./src/routes/achievementRoutes');

const app = express();

// Middleware de seguridad
app.use(helmetConfig);
app.use(limiter);
app.use(requestLogger);

// CORS para desarrollo: permite peticiones desde el frontend local
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Asegurar que cookie-parser se use antes de las rutas
app.use(cookieParser());
app.use(express.json());

// Aplicar noCache a rutas críticas
app.use('/api/auth', noCache);
app.use('/api/achievements', noCache);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pokedex', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => logger.info('Conectado a MongoDB'))
.catch(err => logger.error('Error conectando a MongoDB:', err));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/pokemon', pokemonRoutes);
app.use('/api/achievements', achievementRoutes);

// Middleware para rutas no encontradas (404)
app.all('*', (req, res, next) => {
  next(new AppError(`No se puede encontrar ${req.originalUrl} en este servidor!`, 404));
});

// Middleware de manejo de errores global
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`);
}); 