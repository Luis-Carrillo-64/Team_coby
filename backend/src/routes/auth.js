const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegister, validateFavorite } = require('../middleware/validator');
const { protect, restrictTo } = require('../middleware/auth');

// Rutas públicas
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Rutas protegidas
router.use(protect); // Middleware de autenticación para todas las rutas siguientes

router.get('/verify', authController.verifyToken);
router.put('/preferences', authController.updatePreferences);
router.get('/favorites', authController.getFavorites);
router.post('/favorites/add', validateFavorite, authController.addFavorite);
router.post('/favorites/remove', validateFavorite, authController.removeFavorite);
router.get('/me/achievements', authController.getMeAchievements);

// Rutas de administrador
router.use(restrictTo('admin')); // Middleware de restricción para rutas de admin

router.get('/users', authController.getUsers);
router.post('/users', validateRegister, authController.createUser);
router.put('/users/:id', authController.updateUser);
router.delete('/users/:id', authController.deleteUser);

module.exports = router; 