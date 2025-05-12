const Pokemon = require('../models/Pokemon');

// Obtener todos los pokemon (paginado)
exports.getAllPokemon = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pokemon = await Pokemon.find()
      .skip(skip)
      .limit(limit)
      .sort({ number: 1 });

    const total = await Pokemon.countDocuments();

    res.json({
      pokemon,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pokemon', error: error.message });
  }
};

// Obtener un pokemon por ID
exports.getPokemonById = async (req, res) => {
  try {
    const pokemon = await Pokemon.findById(req.params.id);
    if (!pokemon) {
      return res.status(404).json({ message: 'Pokemon no encontrado' });
    }
    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pokemon', error: error.message });
  }
};

// Crear nuevo pokemon (solo admin)
exports.createPokemon = async (req, res) => {
  try {
    const pokemon = new Pokemon({
      ...req.body,
      createdBy: req.user.id
    });

    await pokemon.save();
    res.status(201).json(pokemon);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear pokemon', error: error.message });
  }
};

// Actualizar pokemon (solo admin)
exports.updatePokemon = async (req, res) => {
  try {
    const pokemon = await Pokemon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!pokemon) {
      return res.status(404).json({ message: 'Pokemon no encontrado' });
    }

    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar pokemon', error: error.message });
  }
};

// Eliminar pokemon (solo admin)
exports.deletePokemon = async (req, res) => {
  try {
    const pokemon = await Pokemon.findByIdAndDelete(req.params.id);
    
    if (!pokemon) {
      return res.status(404).json({ message: 'Pokemon no encontrado' });
    }

    res.json({ message: 'Pokemon eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar pokemon', error: error.message });
  }
};

// Buscar pokemon
exports.searchPokemon = async (req, res) => {
  try {
    const { query } = req.query;
    const searchRegex = new RegExp(query, 'i');

    const pokemon = await Pokemon.find({
      $or: [
        { name: searchRegex },
        { types: searchRegex }
      ]
    }).limit(10);

    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar pokemon', error: error.message });
  }
};

// Obtener todos los pokemon sin paginación (para favoritos)
exports.getAllPokemonNoPaginate = async (req, res) => {
  try {
    const pokemon = await Pokemon.find().sort({ number: 1 });
    res.json({ pokemon });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener todos los pokemon', error: error.message });
  }
}; 