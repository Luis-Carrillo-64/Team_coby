const express = require('express');
const router = express.Router();
const { getAllPokemon, searchPokemon, getAllPokemonNoPaginate, getPokemonById, createPokemon, updatePokemon, deletePokemon } = require('../controllers/pokemonController');
const { protect, restrictTo } = require('../middleware/auth');

// Rutas públicas
router.get('/', getAllPokemon);
router.get('/search', searchPokemon);
router.get('/all', getAllPokemonNoPaginate);
router.get('/:id', getPokemonById);

// Rutas protegidas (solo admin)
router.post('/', protect, restrictTo('admin'), createPokemon);
router.put('/:id', protect, restrictTo('admin'), updatePokemon);
router.delete('/:id', protect, restrictTo('admin'), deletePokemon);

module.exports = router; 