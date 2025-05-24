<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-center">Mis Logros</h1>
    <div v-if="achievements.length > 0" class="text-center mb-6">
      <span class="inline-block bg-green-100 text-green-800 font-semibold px-4 py-2 rounded-full shadow">
        Logros completados: {{ completedAchievements.length }} de {{ achievements.length }}
      </span>
    </div>

    <div v-if="loading" class="text-center text-gray-500">Cargando logros...</div>
    <div v-else-if="error" class="text-center text-red-500">Error al cargar los logros: {{ error.message }}</div>
    <div v-else>
      <div v-if="achievements.length === 0" class="text-center text-gray-600">
        Aún no hay logros disponibles.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="achievement in achievements"
          :key="achievement._id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2"
          :class="{
            'border-yellow-500': achievement.completed,
            'border-gray-300 dark:border-gray-700': !achievement.completed,
          }"
        >
          <h2 class="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{{ achievement.name }}</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">{{ achievement.description }}</p>
          <div class="flex justify-between items-center text-sm">
            <div class="flex items-center gap-2">
              <AchievementIcon :categoria="achievement.category" />
              <span class="font-medium text-gray-700 dark:text-gray-300">Categoría: {{ achievement.category }}</span>
            </div>
            <span
              class="px-3 py-1 rounded-full text-xs font-bold"
              :class="{
                'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200': achievement.completed,
                'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200': !achievement.completed,
              }"
            >
              {{ achievement.completed ? '¡Completado!' : 'Pendiente' }}
            </span>
          </div>
          <div class="mb-2">
            <template v-if="achievement.completed">
              <span class="text-green-700 font-bold">¡Completado! 🎉</span>
            </template>
            <template v-else>
              Progreso: {{ achievement.currentProgress }} / {{ achievement.criteria.requiredCount || 1 }}
            </template>
          </div>
          <div class="progress-bar bg-gray-200 rounded-full h-2 mb-2">
            <div
              class="bg-blue-500 h-2 rounded-full"
              :style="{ width: `${Math.min(100, Math.round((achievement.currentProgress / (achievement.criteria.requiredCount || 1)) * 100))}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="completedAchievements.length > 0" class="mt-10">
      <h2 class="text-2xl font-bold mb-4 text-center">Historial de logros completados</h2>
      <ul class="space-y-4">
        <li v-for="ach in achievements.filter(a => a.completed)" :key="ach._id" class="bg-green-50 border-l-4 border-green-400 p-4 rounded shadow">
          <div class="font-semibold text-green-800">{{ ach.name }}</div>
          <div class="text-gray-700">{{ ach.description }}</div>
          <div v-if="userProgress[ach._id] && userProgress[ach._id].lastUpdated" class="text-xs text-gray-500 mt-1">
            Completado el: {{ new Date(userProgress[ach._id].lastUpdated).toLocaleString() }}
          </div>
        </li>
      </ul>
    </div>
    <div v-else class="mt-10 text-center text-gray-500">
      ¡Aún no has completado ningún logro! Sigue explorando para desbloquearlos.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import AchievementIcon from '../components/AchievementIcon.vue';

const API_URL = import.meta.env.VITE_API_URL;

const achievements = ref([]);
const userProgress = ref({}); // Progreso de cada logro
const completedAchievements = ref([]); // IDs de logros completados
const loading = ref(true);
const error = ref(null);
const authStore = useAuthStore();

const fetchAchievements = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/achievements`);
    achievements.value = response.data;
  } catch (err) {
    error.value = err;
    console.error('Error fetching achievements:', err);
  }
};

const fetchUserProgress = async () => {
  console.log('[fetchUserProgress] Intentando obtener progreso de logros...');
  
  // Validación robusta del usuario
  if (!authStore.user?.id) {
    console.log('[fetchUserProgress] Usuario no autenticado o ID inválido. Limpiando progreso.');
    completedAchievements.value = [];
    userProgress.value = {};
    loading.value = false;
    return;
  }

  console.log(`[fetchUserProgress] Obteniendo progreso para usuario ID: ${authStore.user.id}`);
  
  try {
    const response = await axios.get(`${API_URL}/api/achievements/me`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    console.log('[fetchUserProgress] Progreso obtenido exitosamente');
    console.log('[fetchUserProgress] Datos completos:', response.data);

    // Validar la estructura de los datos recibidos
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Respuesta inválida del servidor');
    }

    completedAchievements.value = Array.isArray(response.data.completedAchievements) 
      ? response.data.completedAchievements 
      : [];
      
    userProgress.value = response.data.achievementProgress || {};

    // --- MAPEO DIRECTO DEL PROGRESO Y COMPLETADO EN achievements ---
    achievements.value.forEach(achievement => {
      const id = String(achievement._id);
      const progress = userProgress.value[id];
      achievement.currentProgress = (progress && typeof progress === 'object' && progress.current !== undefined)
        ? progress.current
        : (typeof progress === 'number' ? progress : 0);
      achievement.completed = completedAchievements.value.includes(id);
    });
    // --------------------------------------------------------------

    console.log(`[fetchUserProgress] Logros completados actualizados. Total: ${completedAchievements.value.length}`);
    console.log(`[fetchUserProgress] Progreso actualizado. Entradas: ${Object.keys(userProgress.value).length}`);

  } catch (err) {
    console.error('[fetchUserProgress] Error al obtener progreso:', err);
    error.value = err;
    
    if (err.response?.status === 401) {
      console.log('[fetchUserProgress] Error de autenticación. Limpiando progreso.');
      authStore.logout(); // Forzar logout si la sesión expiró
      completedAchievements.value = [];
      userProgress.value = {};
    }
  } finally {
    loading.value = false;
    console.log('[fetchUserProgress] Estado de carga actualizado.');
  }
};

onMounted(() => {
  fetchAchievements();
  // fetchUserProgress(); // No llamar aquí para evitar doble llamada si authStore.user ya está poblado
});

// Watch mejorado para el estado de autenticación
watch(() => authStore.user, (newUser) => {
  if (newUser?.id) {
    console.log('Estado de autenticación cambiado: Usuario autenticado. Obteniendo progreso...');
    fetchUserProgress();
  } else {
    console.log('Estado de autenticación cambiado: Usuario no autenticado. Limpiando progreso.');
    completedAchievements.value = [];
    userProgress.value = {};
  }
}, { immediate: true });
</script>

<style scoped>
.achievement-card {
  transition: all 0.3s ease;
}
.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  margin-bottom: 0.5rem;
}
</style> 