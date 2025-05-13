import { describe, it, expect, beforeEach } from 'vitest';

// Simulación de servicio asíncrono de favoritos
const FAVORITOS_KEY = 'favoritos';

const getFavoritosAsync = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = window.localStorage.getItem(FAVORITOS_KEY);
      resolve(data ? JSON.parse(data) : []);
    }, 10);
  });
};

const setFavoritosAsync = (favoritos) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      window.localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));
      resolve();
    }, 10);
  });
};

describe('Servicios de localStorage favoritos', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('guarda y recupera favoritos de forma asíncrona', async () => {
    await setFavoritosAsync(['Charmander']);
    const favs = await getFavoritosAsync();
    expect(favs).toContain('Charmander');
  });

  it('no hace lecturas redundantes si ya hay datos en localStorage', async () => {
    await setFavoritosAsync(['Squirtle']);
    // Simula una función que solo lee si no hay datos en memoria
    let cache = null;
    const getFavoritosOptimizado = async () => {
      if (cache) return cache;
      cache = await getFavoritosAsync();
      return cache;
    };
    const favs1 = await getFavoritosOptimizado();
    const favs2 = await getFavoritosOptimizado();
    expect(favs1).toBe(favs2); // Debe ser la misma referencia (no nueva lectura)
    expect(favs1).toContain('Squirtle');
  });
}); 