<template>
  <div v-if="auth.loadingAuth" class="loading-screen">
    <p>Cargando, por favor espera...</p>
  </div>
  <div v-else class="min-h-screen bg-gradient-to-br from-white via-[#9bbc0f] to-[#8bac0f] dark:from-[#183c1a] dark:via-[#0f380f] dark:to-[#306230] transition-colors duration-500">
    <nav class="sticky top-0 z-40 backdrop-blur bg-gradient-to-b from-white/90 to-[#9bbc0f]/80 dark:from-gray-900/80 dark:to-[#0f380f]/80 shadow-lg rounded-b-3xl border-b-4 border-[#9bbc0f] dark:border-[#0f380f] py-2 px-4 mb-8 transition-colors duration-500 drop-shadow-xl">
      <div class="max-w-7xl mx-auto flex justify-between items-center h-20">
        <div class="flex items-center space-x-4">
          <Icon icon="ic:wotone-catching-pokemon" width="32" height="32" class="text-pokemon-blue dark:text-pokemon-red" />
          <router-link to="/" class="flex items-center">
            <Icon icon="gg:pokemon" width="48" height="48" class="text-pokemon-red dark:text-pokemon-blue drop-shadow-lg" />
            <span class="ml-2 text-3xl font-extrabold text-pokemon-red dark:text-pokemon-blue tracking-tight drop-shadow">Pokédex</span>
          </router-link>
        </div>
        <div class="flex items-center space-x-4">
          <button @click="toggleTheme" class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#9bbc0f] dark:bg-[#0f380f] text-[#0f380f] dark:text-[#9bbc0f] font-bold shadow border border-[#0f380f] dark:border-[#9bbc0f] hover:scale-105 transition-transform">
            <span class="inline-flex items-center justify-center rounded-full bg-white/80 dark:bg-[#306230] p-1">
              <Icon :icon="theme === 'dark' ? 'mdi:weather-night' : 'mdi:weather-sunny'" width="28" height="28" />
            </span>
            {{ theme === 'dark' ? 'Oscuro' : 'Claro' }}
          </button>
          <template v-if="isAuthenticated">
            <router-link v-if="isAdmin" to="/admin" class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#9bbc0f] dark:bg-[#0f380f] text-[#0f380f] dark:text-[#9bbc0f] font-bold shadow border border-[#0f380f] dark:border-[#0f380f] hover:scale-105 transition-transform">
              <Icon icon="game-icons:pokecog" width="22" height="22" class="mr-2" />
              Panel Admin
            </router-link>
            <span v-if="isAdmin" class="px-2 py-1 rounded text-xs font-bold bg-[#eaf5c3] dark:bg-[#306230] text-[#0f380f] dark:text-[#9bbc0f]">{{ userName }} ({{ userRole }})</span>
            <span v-else class="px-2 py-1 rounded text-xs font-bold bg-[#eaf5c3] dark:bg-[#306230] text-[#0f380f] dark:text-[#9bbc0f]">{{ userName }}</span>
            <button @click="logout" class="px-4 py-2 rounded-full bg-[#9bbc0f] text-[#0f380f] dark:text-[#0f380f] font-bold shadow border border-[#0f380f] hover:scale-105 transition-transform">
              Cerrar Sesión
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="px-4 py-2 rounded-full bg-[#0f380f] text-[#9bbc0f] dark:text-[#9bbc0f] font-bold shadow border border-[#0f380f] hover:scale-105 transition-transform">
              Iniciar Sesión
            </router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- Tabs y barra de búsqueda (visibles en rutas específicas) -->
    <div v-if="['/pokedex', '/achievements'].includes($route.path)">
      <!-- Tabs para ver todos, favoritos o logros -->
      <div class="flex justify-center mt-6 mb-2 gap-4">
        <button
          @click="navigateToTab('all')"
          :class="uiStore.activeTab === 'all' ? 'bg-pokemon-red text-white dark:bg-pokemon-blue dark:text-white' : 'bg-white dark:bg-[#223c2a] text-pokemon-red dark:text-pokemon-blue'"
          class="px-6 py-2 rounded-lg font-bold shadow border border-pokemon-red dark:border-pokemon-blue transition-colors"
        >
          Todos
        </button>
        <button
          v-if="isAuthenticated"
          @click="navigateToTab('favorites')"
          :class="uiStore.activeTab === 'favorites' ? 'bg-pokemon-red text-white dark:bg-pokemon-blue dark:text-white' : 'bg-white dark:bg-[#223c2a] text-pokemon-red dark:text-pokemon-blue'"
          class="px-6 py-2 rounded-lg font-bold shadow border border-pokemon-red dark:border-pokemon-blue transition-colors"
        >
          Mis Favoritos
        </button>
        <button
          v-if="isAuthenticated"
          @click="navigateToTab('achievements')"
          :class="uiStore.activeTab === 'achievements' ? 'bg-pokemon-red text-white dark:bg-pokemon-blue dark:text-white' : 'bg-white dark:bg-[#223c2a] text-pokemon-red dark:text-pokemon-blue'"
          class="px-6 py-2 rounded-lg font-bold shadow border border-pokemon-red dark:border-pokemon-blue transition-colors"
        >
          Mis Logros
        </button>
      </div>

      <!-- Barra de búsqueda y filtro (visible solo en la ruta /pokedex) -->
      <div v-if="$route.path === '/pokedex'" class="flex justify-center mt-6 px-4">
        <div class="relative w-full max-w-xl">
          <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
          <div class="relative flex gap-2">
            <input
              type="text"
              :value="uiStore.searchQuery"
              @input="handleSearchInput($event.target.value)"
              placeholder="Buscar Pokémon..."
              class="w-full py-3 pl-5 pr-12 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f] bg-[#8bac0f] dark:bg-[#306230] text-[#0f380f] dark:text-[#9bbc0f] font-pixel text-sm placeholder-[#0f380f] dark:placeholder-[#9bbc0f] placeholder-opacity-50"
            />
            <button
              @click="uiStore.toggleFilters()"
              class="relative group"
            >
              <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
              <div class="relative px-4 py-3 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f] bg-[#8bac0f] dark:bg-[#306230]">
                <Icon icon="mdi:filter-variant" class="w-6 h-6 text-[#0f380f] dark:text-[#9bbc0f]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useUiStore } from '@/stores/ui' // Importar el nuevo store de UI
import { Icon } from '@iconify/vue';

const auth = useAuthStore()
const router = useRouter()
const route = useRoute() // Usar useRoute para acceder a la ruta actual
const themeStore = useThemeStore()
const uiStore = useUiStore() // Usar el nuevo store de UI

const isAuthenticated = computed(() => auth.isAuthenticated)
const isAdmin = computed(() => auth.user?.role === 'admin')
const userName = computed(() => auth.user?.username || '')
const userRole = computed(() => auth.user?.role || '')
const theme = computed(() => themeStore.theme)

const logout = async () => {
  try {
    await auth.logout();
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}

// Función para navegar y actualizar el store de UI
const navigateToTab = (tab) => {
  uiStore.setActiveTab(tab);
  uiStore.setLastRoute(tab === 'achievements' ? '/achievements' : '/pokedex');
  
  if (tab === 'achievements') {
    router.push('/achievements');
  } else {
    router.push('/pokedex');
  }
}

// Función para manejar la entrada de búsqueda y actualizar el store de UI
const handleSearchInput = (value) => {
  uiStore.setSearchQuery(value);
  uiStore.setCurrentPage(1); // Resetear la página al buscar
};

</script> 

<style scoped>
.loading-screen {
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
}

/* Puedes añadir estilos adicionales aquí si es necesario */
</style> 