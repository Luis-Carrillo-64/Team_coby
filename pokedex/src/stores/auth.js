import { defineStore } from 'pinia';
import axios from 'axios';
import Cookies from 'js-cookie';

// Asegura que Axios siempre envíe cookies (token) al backend
axios.defaults.withCredentials = true;

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
      Cookies.set('token', token, {
        expires: 1,
        secure: true,
        sameSite: 'Lax'
      });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },
    logout() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      Cookies.remove('token');
      delete axios.defaults.headers.common['Authorization'];
      window.localStorage.removeItem(FAVORITOS_KEY);
      window.localStorage.removeItem('theme');
      favoritosCache = null;
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
        this.users = response.data; // Asumiendo que la respuesta es un array de usuarios
        return this.users; // Devolver los datos
      } catch (error) {
        if (!error.response) {
          this.errorUsers = 'No se pudo conectar con el servidor. Intenta más tarde.';
        } else {
          this.errorUsers = 'Error al obtener usuarios.';
        }
        console.error('Error fetching users:', error);
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
        // Eliminar el usuario de la lista local si la eliminación en el backend fue exitosa
        this.users = this.users.filter(user => user._id !== id);
        return response.data; // O true si la eliminación fue exitosa
      } catch (error) {
        this.errorUsers = 'Error al eliminar usuario.';
        console.error('Error deleting user:', error);
        throw error;
      }
    },
    async getFavorites() {
      // Siempre intenta leer de caché en memoria
      if (favoritosCache) {
        this.favorites = favoritosCache; // Cargar desde caché al estado del store
        return favoritosCache;
      }
      // Luego intenta leer de localStorage con validación robusta
      let local = null;
      try {
        local = window.localStorage.getItem(FAVORITOS_KEY);
        if (local) {
          favoritosCache = JSON.parse(local);
          this.favorites = favoritosCache; // Cargar desde localStorage al estado del store
          return favoritosCache;
        }
      } catch (e) {
        // Si hay error, limpiar localStorage corrupto y caché
        window.localStorage.removeItem(FAVORITOS_KEY);
        favoritosCache = null;
         this.favorites = []; // Asegurar que el estado sea un array vacío en caso de error
      }
      // Si no hay en localStorage, pide al backend. Axios enviará las cookies automáticamente.
      try {
        const response = await axios.get(`${API_URL}/api/auth/favorites`);
        favoritosCache = response.data.favorites;
        this.favorites = favoritosCache; // Actualizar estado del store
        window.localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritosCache));
        return favoritosCache;
      } catch (error) {
        if (!error.response) {
          this.errorFavorites = 'No se pudo conectar con el servidor. Intenta más tarde.';
        } else {
          this.errorFavorites = 'Error al obtener favoritos.';
        }
        console.error('Error fetching favorites:', error);
        throw error;
      }
    },
    async addFavorite(pokemonName) {
       this.loadingFavorites = true; // Estado de carga para favoritos
       this.errorFavorites = null; // Limpiar errores anteriores
       // Axios enviará las cookies automáticamente.
      try {
        const response = await axios.post(`${API_URL}/api/auth/favorites/add`, { pokemonName });
        favoritosCache = response.data.favorites; // El backend debe devolver la lista actualizada
        this.favorites = favoritosCache; // Actualizar estado del store
        // Siempre sincronizar localStorage
        window.localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritosCache));
        return favoritosCache;
      } catch (error) {
        if (!error.response) {
          this.errorFavorites = 'No se pudo conectar con el servidor. Intenta más tarde.';
        } else {
          this.errorFavorites = 'Error al agregar favorito.';
        }
        console.error('Error al agregar favorito:', error);
        throw error;
      } finally {
        this.loadingFavorites = false; // Finalizar carga
      }
    },
    async removeFavorite(pokemonName) {
       this.loadingFavorites = true; // Estado de carga para favoritos
       this.errorFavorites = null; // Limpiar errores anteriores
      // Axios enviará las cookies automáticamente.
      try {
        const response = await axios.post(`${API_URL}/api/auth/favorites/remove`, { pokemonName });
        favoritosCache = response.data.favorites; // El backend debe devolver la lista actualizada
        this.favorites = favoritosCache; // Actualizar estado del store
        // Siempre sincronizar localStorage
        window.localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritosCache));
        return favoritosCache;
      } catch (error) {
        if (!error.response) {
          this.errorFavorites = 'No se pudo conectar con el servidor. Intenta más tarde.';
        } else {
          this.errorFavorites = 'Error al quitar favorito.';
        }
        console.error('Error al quitar favorito:', error);
        throw error;
      } finally {
        this.loadingFavorites = false; // Finalizar carga
      }
    },
    async fetchAchievementsAdmin() {
      try {
        const response = await axios.get(`${API_URL}/api/achievements`);
        this.achievements = response.data; // Asumiendo que la respuesta es un array de logros
        return this.achievements; // Devolver los datos
      } catch (error) {
        if (!error.response) {
          this.errorAchievements = 'No se pudo conectar con el servidor. Intenta más tarde.';
        } else {
          this.errorAchievements = 'Error al obtener logros.';
        }
        console.error('Error fetching achievements:', error);
        throw error;
      }
    },
    async createAchievement(achievementData) {
      try {
        const response = await axios.post(`${API_URL}/api/achievements`, achievementData);
        // Opcional: añadir el nuevo logro a la lista local si el backend lo devuelve
        // this.achievements.push(response.data);
        return response.data;
      } catch (error) {
        this.errorAchievements = 'Error al crear logro.';
        console.error('Error al crear logro:', error);
        throw error;
      }
    },
    async updateAchievement(id, achievementData) {
      try {
        const response = await axios.put(`${API_URL}/api/achievements/${id}`, achievementData);
         // Opcional: actualizar el logro en la lista local
         // const index = this.achievements.findIndex(a => a._id === id);
         // if (index !== -1) this.achievements[index] = response.data;
        return response.data;
      } catch (error) {
        this.errorAchievements = 'Error al actualizar logro.';
        console.error('Error al actualizar logro:', error);
        throw error;
      }
    },
    async deleteAchievement(id) {
      try {
        const response = await axios.delete(`${API_URL}/api/achievements/${id}`);
        // Eliminar el logro de la lista local si la eliminación en el backend fue exitosa
        this.achievements = this.achievements.filter(achievement => achievement._id !== id);
        return response.data;
      } catch (error) {
        this.errorAchievements = 'Error al eliminar logro.';
        console.error('Error al eliminar logro:', error);
        throw error;
      }
    }
  }
}); 