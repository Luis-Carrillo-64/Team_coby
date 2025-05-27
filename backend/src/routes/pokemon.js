const express = require('express');
const router = express.Router();
const pokemonController = require('../controllers/pokemonController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/', pokemonController.getAllPokemon);
router.get('/search', pokemonController.searchPokemon);
router.get('/all', pokemonController.getAllPokemonNoPaginate);
router.get('/:id', pokemonController.getPokemonById);

// Rutas protegidas (solo admin)
router.post('/', authenticateToken, isAdmin, pokemonController.createPokemon);
router.put('/:id', authenticateToken, isAdmin, pokemonController.updatePokemon);
router.delete('/:id', authenticateToken, isAdmin, pokemonController.deletePokemon);

module.exports = router; 