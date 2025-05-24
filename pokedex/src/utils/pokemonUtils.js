export function getTypeColor(type) {
  const typeColors = {
    normal: { bg: '#A8A77A', border: '#7D7D4C', text: '#FFFFFF' },
    fire: { bg: '#EE8160', border: '#C62828', text: '#FFFFFF' },
    water: { bg: '#6390F0', border: '#1565C0', text: '#FFFFFF' },
    electric: { bg: '#F7D02C', border: '#FBC02D', text: '#212121' },
    grass: { bg: '#7AC74C', border: '#33691E', text: '#FFFFFF' },
    ice: { bg: '#96D9D6', border: '#4DD0E1', text: '#212121' },
    fighting: { bg: '#C22E28', border: '#B71C1C', text: '#FFFFFF' },
    poison: { bg: '#A33EA1', border: '#6A1B9A', text: '#FFFFFF' },
    ground: { bg: '#E2BF65', border: '#BF360C', text: '#212121' },
    flying: { bg: '#A98FF3', border: '#673AB7', text: '#212121' },
    psychic: { bg: '#F95587', border: '#E91E63', text: '#FFFFFF' },
    bug: { bg: '#A6B91A', border: '#827717', text: '#FFFFFF' },
    rock: { bg: '#B6A136', border: '#8D6E63', text: '#FFFFFF' },
    ghost: { bg: '#735797', border: '#4527A0', text: '#FFFFFF' },
    dragon: { bg: '#6F35FC', border: '#311B92', text: '#FFFFFF' },
    dark: { bg: '#705746', border: '#4E342E', text: '#FFFFFF' },
    steel: { bg: '#B7B7CE', border: '#757575', text: '#212121' },
    fairy: { bg: '#D685AD', border: '#EC407A', text: '#212121' },
    // Añade más tipos si es necesario
  };
  
  const lowerCaseType = type.toLowerCase();
  return typeColors[lowerCaseType] || { bg: '#757575', border: '#616161', text: '#FFFFFF' }; // Color por defecto si el tipo no se encuentra
} 