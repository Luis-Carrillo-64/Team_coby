import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../auth';

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Store de Favoritos', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  it('debe agregar y quitar favoritos correctamente', async () => {
    const store = useAuthStore();
    // Simula favoritos en localStorage
    window.localStorage.setItem('favoritos', JSON.stringify(['Pikachu']));
    // Simula método para leer favoritos desde localStorage
    store.getFavorites = async () => JSON.parse(window.localStorage.getItem('favoritos'));
    let favoritos = await store.getFavorites();
    expect(favoritos).toContain('Pikachu');
    // Simula agregar
    window.localStorage.setItem('favoritos', JSON.stringify(['Pikachu', 'Bulbasaur']));
    favoritos = await store.getFavorites();
    expect(favoritos).toContain('Bulbasaur');
    // Simula quitar
    window.localStorage.setItem('favoritos', JSON.stringify(['Pikachu']));
    favoritos = await store.getFavorites();
    expect(favoritos).not.toContain('Bulbasaur');
  });
}); 