const Pokemon = require('../models/Pokemon');

// Obtener todos los pokemon (paginado)
exports.getAllPokemon = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtros
    const andFilters = [];

    // Filtro por nombre (empieza con la letra)
    if (req.query.letter) {
      andFilters.push({ name: new RegExp('^' + req.query.letter, 'i') });
    }

    // Filtro por tipos (uno o varios)
    if (req.query.types) {
      const types = Array.isArray(req.query.types) ? req.query.types : req.query.types.split(',');
      andFilters.push({ types: { $in: types } });
    }

    // Filtro por generación (rango de número)
    if (req.query.generation) {
      const generations = {
        '1': { start: 1, end: 151 },
        '2': { start: 152, end: 251 },
        '3': { start: 252, end: 386 },
        '4': { start: 387, end: 493 },
        '5': { start: 494, end: 649 },
        '6': { start: 650, end: 721 },
        '7': { start: 722, end: 809 }
      };
      const gen = generations[req.query.generation];
      if (gen) {
        andFilters.push({ number: { $gte: gen.start, $lte: gen.end } });
      }
    }

    // Filtro por estadística
    if (req.query.stat && req.query.statValue && req.query.statOp) {
      const statField = `stats.${req.query.stat}`;
      const value = parseInt(req.query.statValue);
      let statFilter = {};
      switch (req.query.statOp) {
        case '>': statFilter[statField] = { $gt: value }; break;
        case '<': statFilter[statField] = { $lt: value }; break;
        case '=': statFilter[statField] = value; break;
      }
      andFilters.push(statFilter);
    }

    // Filtro por búsqueda de texto (nombre)
    if (req.query.search) {
      andFilters.push({ name: new RegExp(req.query.search, 'i') });
    }

    // Combinar todos los filtros
    const filter = andFilters.length > 0 ? { $and: andFilters } : {};

    const pokemon = await Pokemon.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ number: 1 });

    const total = await Pokemon.countDocuments(filter);

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