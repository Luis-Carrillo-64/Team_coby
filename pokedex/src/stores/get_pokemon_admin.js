const fs = require('fs');
const axios = require('axios');

const TOTAL_POKEMON = 151;

// Para poner la primera letra en mayúscula
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function getPokemonData(id) {
  const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${id}`;

  const [pokemonRes, speciesRes] = await Promise.all([
    axios.get(pokemonUrl),
    axios.get(speciesUrl)
  ]);

  const pokemon = pokemonRes.data;
  const species = speciesRes.data;

  // Buscar la descripción en español, si no hay, usar inglés
  let description = '';
  const entry = species.flavor_text_entries.find(
    e => e.language.name === 'es'
  ) || species.flavor_text_entries.find(
    e => e.language.name === 'en'
  );
  if (entry) description = entry.flavor_text.replace(/\n|\f/g, ' ');

  // Formato para el panel admin
  return {
    name: capitalize(pokemon.name),
    number: pokemon.id,
    types: pokemon.types.map(t => capitalize(t.type.name)),
    description,
    height: pokemon.height / 10, // metros
    weight: pokemon.weight / 10, // kg
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
    stats: {
      hp: pokemon.stats.find(s => s.stat.name === 'hp').base_stat,
      attack: pokemon.stats.find(s => s.stat.name === 'attack').base_stat,
      defense: pokemon.stats.find(s => s.stat.name === 'defense').base_stat,
      specialAttack: pokemon.stats.find(s => s.stat.name === 'special-attack').base_stat,
      specialDefense: pokemon.stats.find(s => s.stat.name === 'special-defense').base_stat,
      speed: pokemon.stats.find(s => s.stat.name === 'speed').base_stat,
    }
  };
}

(async () => {
  const pokemons = [];
  for (let i = 1; i <= TOTAL_POKEMON; i++) {
    try {
      console.log(`Descargando Pokémon #${i}...`);
      const data = await getPokemonData(i);
      pokemons.push(data);
    } catch (err) {
      console.error(`Error con el Pokémon #${i}:`, err.message);
    }
  }
  fs.writeFileSync('pokemon.json', JSON.stringify(pokemons, null, 2), 'utf-8');
  console.log('¡Listo! Archivo pokemons_admin.json creado con los 151 Pokémon en el formato de tu panel de admin.');
})();
