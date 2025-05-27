const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas
router.get('/verify', authenticateToken, authController.verifyToken);
router.put('/preferences', authenticateToken, authController.updatePreferences);
router.get('/users', authenticateToken, isAdmin, authController.getUsers);
router.get('/favorites', authenticateToken, authController.getFavorites);
router.post('/favorites/add', authenticateToken, authController.addFavorite);
router.post('/favorites/remove', authenticateToken, authController.removeFavorite);

// Admin: gestión de usuarios
router.post('/users', authenticateToken, isAdmin, authController.createUser);
router.put('/users/:id', authenticateToken, isAdmin, authController.updateUser);
router.delete('/users/:id', authenticateToken, isAdmin, authController.deleteUser);

module.exports = router; 