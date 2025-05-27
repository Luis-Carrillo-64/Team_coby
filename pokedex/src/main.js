import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useThemeStore } from './stores/theme'
import axios from 'axios'
import { useAuthStore } from './stores/auth'
import Cookies from 'js-cookie'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

const themeStore = useThemeStore()
themeStore.initTheme()

const authStore = useAuthStore()

// Interceptor para inyectar el token en cada petición
axios.interceptors.request.use(config => {
  // Si el usuario está autenticado y hay token en el store o en cookies, úsalo
  const token = authStore.token || Cookies.get('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

// Interceptor para manejar expiración de token
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && [401, 403].includes(error.response.status)) {
      authStore.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

app.mount('#app') 