const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { protect, restrictTo } = require('../middleware/auth');
const { handleAchievementEvent } = require('../middleware/achievementProgress');

// Rutas públicas
router.get('/', achievementController.getAllAchievements);

// Rutas protegidas (requieren autenticación)
router.use(protect);

// Obtener logros del usuario actual
router.get('/me', achievementController.getUserAchievements);

// Rutas de administrador
router.use(restrictTo('admin'));

// Crear un nuevo logro
router.post('/', achievementController.createAchievement);

// Actualizar un logro existente
router.put('/:id', achievementController.updateAchievement);

// Eliminar un logro
router.delete('/:id', achievementController.deleteAchievement);

// Middleware para manejar eventos de logros
router.post('/event', handleAchievementEvent);

module.exports = router; 