import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const usePokemonStore = defineStore('pokemon', {
  state: () => ({
    pokemon: [],
    allPokemon: [],
    currentPokemon: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0
    }
  }),

  actions: {
    async fetchPokemon(page = 1, limit = 10, filters = {}) {
      this.loading = true;
      try {
        const params = { page, limit, ...filters };
        const response = await axios.get(`${API_URL}/api/pokemon`, { params });
        this.pokemon = response.data.pokemon;
        this.pagination = {
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          total: response.data.total
        };
      } catch (error) {
        this.error = 'Error al cargar los Pokemon';
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchPokemonById(id) {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/api/pokemon/${id}`);
        this.currentPokemon = response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          this.error = 'No se encontró el Pokémon solicitado';
        } else if (error.response?.status === 401) {
          this.error = 'Necesitas iniciar sesión para ver este Pokémon';
        } else {
          this.error = 'Error al cargar el Pokémon. Por favor, intenta de nuevo más tarde';
        }
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    },

    async searchPokemon(query) {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/api/pokemon/search?query=${query}`);
        this.pokemon = response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          this.error = 'No se encontraron Pokémon que coincidan con tu búsqueda';
        } else {
          this.error = 'Error al buscar Pokémon. Por favor, intenta de nuevo';
        }
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    },

    // Métodos solo para administradores
    async createPokemon(pokemonData) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_URL}/api/pokemon`, pokemonData);
        return response.data;
      } catch (error) {
        this.error = 'Error al crear el Pokemon';
        console.error('Error:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updatePokemon(id, pokemonData) {
      this.loading = true;
      try {
        const response = await axios.put(`${API_URL}/api/pokemon/${id}`, pokemonData);
        return response.data;
      } catch (error) {
        this.error = 'Error al actualizar el Pokemon';
        console.error('Error:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deletePokemon(id) {
      this.loading = true;
      try {
        await axios.delete(`${API_URL}/api/pokemon/${id}`);
        return true;
      } catch (error) {
        this.error = 'Error al eliminar el Pokemon';
        console.error('Error:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAllPokemon() {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/api/pokemon/all`);
        this.allPokemon = response.data.pokemon;
        // No actualizamos paginación aquí
      } catch (error) {
        this.error = 'Error al cargar todos los Pokemon';
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}); 