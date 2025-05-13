<template>
  <div class="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-white via-[#9bbc0f] to-[#8bac0f] dark:from-[#183c1a] dark:via-[#0f380f] dark:to-[#306230] transition-colors duration-500 overflow-hidden py-8 sm:py-12 px-2 sm:px-4 lg:px-8">
    <!-- Patrón Pokéball modo claro -->
    <svg class="absolute inset-0 w-full h-full opacity-10 pointer-events-none dark:hidden" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" stroke="#0f380f" stroke-width="8" fill="none" />
      <circle cx="100" cy="100" r="30" stroke="#0f380f" stroke-width="8" fill="none" />
      <rect x="10" y="90" width="180" height="20" fill="#0f380f" />
    </svg>
    <!-- Patrón Pokéball modo oscuro -->
    <svg class="absolute inset-0 w-full h-full opacity-30 pointer-events-none hidden dark:block" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" stroke="#9bbc0f" stroke-width="8" fill="none" />
      <circle cx="100" cy="100" r="30" stroke="#9bbc0f" stroke-width="8" fill="none" />
      <rect x="10" y="90" width="180" height="20" fill="#9bbc0f" />
    </svg>
    <div class="max-w-md w-full space-y-8 bg-white/90 dark:bg-[#183c1a]/90 rounded-3xl shadow-2xl p-6 sm:p-8 border-t-8 border-pokemon-red dark:border-pokemon-blue relative z-10 text-[#0f380f] dark:text-[#9bbc0f] transition-all duration-300 animate-fade-in">
      <div class="flex flex-col items-center">
        <Icon icon="gg:pokemon" width="48" height="48" class="text-pokemon-red dark:text-pokemon-blue drop-shadow mb-2 animate-bounce-subtle" />
        <h2 class="text-2xl sm:text-3xl font-extrabold text-pokemon-red dark:text-pokemon-blue mb-2 drop-shadow">Crear una cuenta</h2>
      </div>
      <form class="mt-4 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Usuario</label>
            <input
              id="username"
              v-model="username"
              name="username"
              type="text"
              required
              class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pokemon-blue dark:focus:ring-pokemon-red shadow text-base sm:text-lg transition-all duration-200"
              placeholder="Usuario"
            />
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pokemon-blue dark:focus:ring-pokemon-red shadow text-base sm:text-lg transition-all duration-200"
              placeholder="Email"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Contraseña</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pokemon-blue dark:focus:ring-pokemon-red shadow text-base sm:text-lg transition-all duration-200"
              placeholder="Contraseña"
            />
          </div>
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              class="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pokemon-blue dark:focus:ring-pokemon-red shadow text-base sm:text-lg transition-all duration-200"
              placeholder="Confirmar Contraseña"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            :disabled="loading || !isValid"
            :class="[
              'w-full flex justify-center items-center py-3 px-4 border border-transparent text-base sm:text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2',
              loading || !isValid
                ? 'bg-[#eaf5c3] text-[#0f380f] dark:bg-[#bada55] dark:text-[#0f380f] cursor-not-allowed opacity-80'
                : 'bg-pokemon-red dark:bg-[#9bbc0f] text-white dark:text-[#0f380f] focus:ring-pokemon-blue dark:focus:ring-[#9bbc0f] dark:hover:bg-[#bada55]'
            ]"
          >
            <span :class="loading || !isValid ? 'text-[#0f380f] dark:text-[#0f380f]' : 'text-white dark:text-[#0f380f]'">Registrarse</span>
            <svg v-if="loading" class="animate-spin h-6 w-6 text-white dark:text-[#0f380f] ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </div>
        <div class="text-sm text-center">
          <router-link
            to="/login"
            class="font-medium text-pokemon-blue dark:text-pokemon-red hover:underline transition-colors duration-200"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </router-link>
        </div>
      </form>
      <div v-if="error" class="mt-4 text-center text-sm text-red-600 font-bold animate-fade-in">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { Icon } from '@iconify/vue';

const router = useRouter();
const auth = useAuthStore();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');

const isValid = computed(() => {
  return (
    username.value.length >= 3 &&
    email.value.includes('@') &&
    password.value.length >= 6 &&
    password.value === confirmPassword.value
  );
});

const handleSubmit = async () => {
  if (!isValid.value) {
    error.value = 'Por favor, verifica los datos ingresados';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await auth.register(username.value, email.value, password.value);
    router.push('/pokedex');
  } catch (e) {
    error.value = 'Error al registrar usuario. El usuario o email ya existe.';
  } finally {
    loading.value = false;
  }
};
</script>

<style>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.5s ease;
}
</style> 