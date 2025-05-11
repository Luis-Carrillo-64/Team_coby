<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-[#9bbc0f] to-[#8bac0f] dark:from-[#183c1a] dark:via-[#0f380f] dark:to-[#306230] transition-colors duration-500">
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
          <router-link v-if="isAuthenticated && isAdmin" to="/admin" class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#9bbc0f] dark:bg-[#0f380f] text-[#0f380f] dark:text-[#9bbc0f] font-bold shadow border border-[#0f380f] dark:border-[#9bbc0f] hover:scale-105 transition-transform">
            <Icon icon="game-icons:pokecog" width="22" height="22" class="mr-2" />
            Panel Admin
          </router-link>
          <span v-if="isAuthenticated && isAdmin" class="px-2 py-1 rounded text-xs font-bold bg-[#eaf5c3] dark:bg-[#306230] text-[#0f380f] dark:text-[#9bbc0f]">{{ userName }} ({{ userRole }})</span>
          <span v-else-if="isAuthenticated" class="px-2 py-1 rounded text-xs font-bold bg-[#eaf5c3] dark:bg-[#306230] text-[#0f380f] dark:text-[#9bbc0f]">{{ userName }}</span>
          <router-link v-if="!isAuthenticated" to="/login" class="px-4 py-2 rounded-full bg-[#0f380f] text-[#9bbc0f] font-bold shadow border border-[#0f380f] hover:scale-105 transition-transform">
            Iniciar Sesión
          </router-link>
          <button v-else @click="logout" class="px-4 py-2 rounded-full bg-[#9bbc0f] text-[#0f380f] font-bold shadow border border-[#0f380f] hover:scale-105 transition-transform">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { Icon } from '@iconify/vue';

const auth = useAuthStore()
const router = useRouter()
const themeStore = useThemeStore()

const isAuthenticated = computed(() => auth.isAuthenticated)
const isAdmin = computed(() => auth.user?.role === 'admin')
const userName = computed(() => auth.user?.username || '')
const userRole = computed(() => auth.user?.role || '')
const theme = computed(() => themeStore.theme)

const logout = async () => {
  await auth.logout()
  router.push('/login')
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script> 