import { defineStore } from 'pinia';
import axios from 'axios';
import Cookies from 'js-cookie';

// Asegura que Axios siempre envíe cookies (token) al backend
axios.defaults.withCredentials = true;

const API_URL = import.meta.env.VITE_API_URL;
const FAVORITOS_KEY = 'favoritos';
let favoritosCache = null;

// Interceptor para manejar errores 401 y refresh token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401, no es una solicitud de refresh token, y no hemos reintentado
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/refresh-token')) {
      originalRequest._retry = true;

      try {
        // Intentar refresh token llamando al backend
        // El backend actualizará las cookies httpOnly automáticamente si tiene un refresh token válido
        await axios.post(`${API_URL}/api/auth/refresh-token`);

        // Reintentar la solicitud original con las nuevas cookies (Axios lo hace automáticamente con withCredentials)
        return axios(originalRequest);
      } catch (refreshError) {
        // Si el refresh token falla o expira, cerrar sesión forzadamente
        const authStore = useAuthStore();
        // Llama a la acción logout que ahora contactará al backend para limpiar cookies
        await authStore.logout(); 
        return Promise.reject(refreshError); // Rechaza la promesa para que el error se propague al código que hizo la llamada original
      }
    }

    return Promise.reject(error); // Si el error no es 401 o ya reintentamos, propágalo
  }
);

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    // El token ya no se guarda aquí, se maneja por cookies httpOnly
    isAuthenticated: false
  }),

  actions: {
    async login(username, password) {
      try {
        // La respuesta del backend ahora solo contiene el usuario, los tokens van en cookies
        const response = await axios.post(`${API_URL}/api/auth/login`, {
          username,
          password
        });

        // No recibimos tokens aquí, solo el usuario
        const { user } = response.data;
        this.setAuth(user); // Actualizar solo el estado del usuario
        return true;
      } catch (error) {
        console.error('Error en login:', error);
        throw error;
      }
    },

    async register(username, email, password) {
      try {
        // La respuesta del backend ahora solo contiene el usuario, los tokens van en cookies
        const response = await axios.post(`${API_URL}/api/auth/register`, {
          username,
          email,
          password
        });

        // No recibimos tokens aquí, solo el usuario
        const { user } = response.data;
        this.setAuth(user); // Actualizar solo el estado del usuario
        return true;
      } catch (error) {
        console.error('Error en registro:', error);
        throw error;
      }
    },

    // Actualizar solo el estado del usuario y la autenticación
    setAuth(user) {
      this.user = user;
      this.isAuthenticated = !!user; // isAuthenticated es true si hay un objeto user
      // Los headers de autorización ahora se manejan automáticamente por las cookies con withCredentials = true
      // No necesitamos configurar axios.defaults.headers.common['Authorization'] aquí
    },
    
    // Acción para verificar si el usuario ya está autenticado (al cargar la app)
    async checkAuth() {
      try {
        // Intenta obtener el usuario del backend. Si las cookies httpOnly son válidas, backend responderá con el usuario.
        const response = await axios.get(`${API_URL}/api/auth/verify`);
        this.setAuth(response.data); // Si tiene éxito, establece el usuario y isAuthenticated a true
        return true;
      } catch (error) {
        // Si falla (ej: no hay cookie, token expirado), se considera no autenticado
        this.setAuth(null); // Limpia el estado de autenticación
        console.log('No autenticado o sesión expirada.'); // Log menos intrusivo
        // No lances el error aquí, ya que es un flujo esperado si no hay sesión
        return false;
      }
    },

    async logout() {
      try {
        // Llama al backend para limpiar las cookies httpOnly
        await axios.post(`${API_URL}/api/auth/logout`);
      } catch (error) {
         console.error('Error al cerrar sesión en el backend:', error);
         // Continuar con la limpieza local aunque falle el backend
      }
      
      this.user = null;
      this.isAuthenticated = false;
      // No necesitamos limpiar headers de Authorization porque se maneja por cookies
      
      // Limpieza de localStorage y caché
      window.localStorage.removeItem(FAVORITOS_KEY);
      window.localStorage.removeItem('theme');
      favoritosCache = null;
      
      // Redirigir después del logout debe manejarse en el componente de la vista/barra de navegación.
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

    // Modificar getFavorites para no depender del token en el estado de Pinia, confía en las cookies
    async getFavorites() {
      // Siempre intenta leer de caché en memoria
      if (favoritosCache) return favoritosCache;
      // Luego intenta leer de localStorage con validación robusta
      let local = null;
      try {
        local = window.localStorage.getItem(FAVORITOS_KEY);
        if (local) {
          favoritosCache = JSON.parse(local);
          return favoritosCache;
        }
      } catch (e) {
        // Si hay error, limpiar localStorage corrupto y caché
        window.localStorage.removeItem(FAVORITOS_KEY);
        favoritosCache = null;
      }
      // Si no hay en localStorage, pide al backend. Axios enviará las cookies automáticamente.
      try {
        const response = await axios.get(`${API_URL}/api/auth/favorites`);
        favoritosCache = response.data.favorites;
        window.localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritosCache));
        return favoritosCache;
      } catch (error) {
        // Si el error es 401 (unauthorized), el interceptor ya manejará el refresh o logout
        // Solo loguea si es otro tipo de error o si el interceptor ya falló
        console.error('Error al obtener favoritos:', error);
        throw error;
      }
    },

    async addFavorite(pokemonName) {
       // Axios enviará las cookies automáticamente.
      try {
        const response = await axios.post(`${API_URL}/api/auth/favorites/add`, { pokemonName });
        favoritosCache = response.data.favorites;
        // Siempre sincronizar localStorage
        window.localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritosCache));
        return favoritosCache;
      } catch (error) {
        console.error('Error al agregar favorito:', error);
        throw error;
      }
    },

    async removeFavorite(pokemonName) {
      // Axios enviará las cookies automáticamente.
      try {
        const response = await axios.post(`${API_URL}/api/auth/favorites/remove`, { pokemonName });
        favoritosCache = response.data.favorites;
        // Siempre sincronizar localStorage
        window.localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritosCache));
        return favoritosCache;
      } catch (error) {
        console.error('Error al quitar favorito:', error);
        throw error;
      }
    }
  }
}); 