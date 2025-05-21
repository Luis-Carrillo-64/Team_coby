require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { logger, limiter, requestLogger, helmetConfig } = require('./src/config/security');
const { errorHandler } = require('./src/middleware/errorHandler');
const { validateLogin, validateRegister, validateFavorite } = require('./src/middleware/validator');

const authRoutes = require('./src/routes/auth');
const pokemonRoutes = require('./src/routes/pokemon');

const app = express();

// Middleware de seguridad
app.use(helmetConfig);
app.use(limiter);
app.use(requestLogger);

// Middleware básico
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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

// Middleware de manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`);
}); 