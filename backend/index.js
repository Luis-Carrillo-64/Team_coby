require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { logger, limiter, requestLogger, helmetConfig } = require('./src/config/security');

const authRoutes = require('./src/routes/auth');
const pokemonRoutes = require('./src/routes/pokemon');

const app = express();

// Middleware de seguridad
app.use(helmetConfig);
app.use(limiter);
app.use(requestLogger);

// Configuración CORS para varios orígenes permitidos
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://jolly-beach-00c756310.6.azurestaticapps.net'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origen (postman, curl, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `El CORS no está permitido para este origen: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
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
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Algo salió mal!' 
      : err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`);
});
