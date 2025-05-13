import { defineStore } from 'pinia';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL;
const FAVORITOS_KEY = 'favoritos';
let favoritosCache = null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: Cookies.get('token') || null,
    isAuthenticated: false
  }),

  actions: {
    async login(username, password) {
      try {
        const response = await axios.post(`${API_URL}/api/auth/login`, {
          username,
          password
        });

        const { token, user } = response.data;
        this.setAuth(token, user);
        return true;
      } catch (error) {
        console.error('Error en login:', error);
        throw error;
      }
    },

    async register(username, email, password) {
      try {
        const response = await axios.post(`${API_URL}/api/auth/register`, {
          username,
          email,
          password
        });

        const { token, user } = response.data;
        this.setAuth(token, user);
        return true;
      } catch (error) {
        console.error('Error en registro:', error);
        throw error;
      }
    },

    setAuth(token, user) {
      this.token = token;
      this.user = user;
      this.isAuthenticated = true;
      Cookies.set('token', token, { expires: 1 }); // Expira en 1 día
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    logout() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      Cookies.remove('token');
      delete axios.defaults.headers.common['Authorization'];
    },

    async updatePreferences(preferences) {
      try {
        const response = await axios.put(`${API_URL}/api/auth/preferences`, preferences);
        this.user = response.data;
        return true;
      } catch (error) {
        console.error('Error actualizando preferencias:', error);
        throw error;
      }
    },

    async getAllUsers() {
      try {
        const response = await axios.get(`${API_URL}/api/auth/users`);
        return response.data;
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
      }
    },

    async createUser(user) {
      try {
        const response = await axios.post(`${API_URL}/api/auth/users`, user);
        return response.data;
      } catch (error) {
        console.error('Error al crear usuario:', error);
        throw error;
      }
    },

    async updateUser(id, user) {
      try {
        const response = await axios.put(`${API_URL}/api/auth/users/${id}`, user);
        return response.data;
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
      }
    },

    async deleteUser(id) {
      try {
        const response = await axios.delete(`${API_URL}/api/auth/users/${id}`);
        return response.data;
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        throw error;
      }
    },

    async getFavorites() {
      // Primero intenta leer de caché en memoria
      if (favoritosCache) return favoritosCache;
      // Luego intenta leer de localStorage
      const local = window.localStorage.getItem(FAVORITOS_KEY);
      if (local) {
        favoritosCache = JSON.parse(local);
        return favoritosCache;
      }
      // Si no hay en localStorage, pide al backend
      try {
        const response = await axios.get(`${API_URL}/api/auth/favorites`);
        favoritosCache = response.data.favorites;
        window.localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritosCache));
        return favoritosCache;
      } catch (error) {
        console.error('Error al obtener favoritos:', error);
        throw error;
      }
    },

    async addFavorite(pokemonName) {
      try {
        const response = await axios.post(`${API_URL}/api/auth/favorites/add`, { pokemonName });
        favoritosCache = response.data.favorites;
        window.localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritosCache));
        return favoritosCache;
      } catch (error) {
        console.error('Error al agregar favorito:', error);
        throw error;
      }
    },

    async removeFavorite(pokemonName) {
      try {
        const response = await axios.post(`${API_URL}/api/auth/favorites/remove`, { pokemonName });
        favoritosCache = response.data.favorites;
        window.localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritosCache));
        return favoritosCache;
      } catch (error) {
        console.error('Error al quitar favorito:', error);
        throw error;
      }
    }
  }
}); 