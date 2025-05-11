<template>
  <div class="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-white via-[#9bbc0f] to-[#8bac0f] dark:from-[#183c1a] dark:via-[#0f380f] dark:to-[#306230] transition-colors duration-500 overflow-hidden">
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
    <div class="w-full relative z-10">
      <header class="sticky top-0 z-30 bg-white/80 dark:bg-gradient-to-br dark:from-[#183c1a] dark:via-[#223c2a] dark:to-[#306230] shadow-2xl rounded-b-3xl border-b-4 border-pokemon-red dark:border-pokemon-blue py-2 px-4 mb-8 flex items-center justify-between backdrop-blur-lg transition-colors duration-500">
        <div class="flex items-center gap-4">
          <router-link to="/pokedex" class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#9bbc0f] dark:bg-[#0f380f] text-[#0f380f] dark:text-[#9bbc0f] font-bold shadow border border-[#0f380f] dark:border-[#9bbc0f] hover:scale-105 transition-transform">
            <Icon icon="ic:round-arrow-back" width="22" height="22" />
            Volver a Pokédex
          </router-link>
        </div>
        <div class="flex items-center gap-4">
          <Icon icon="game-icons:pokecog" width="32" height="32" class="text-pokemon-red dark:text-pokemon-blue drop-shadow" />
          <h1 class="text-3xl font-bold text-pokemon-red dark:text-pokemon-blue drop-shadow">Panel de Administración</h1>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Tabs -->
        <div class="flex gap-4 mb-8">
          <button @click="activeTab = 'pokemon'" :class="activeTab === 'pokemon' ? 'bg-pokemon-red text-white dark:bg-pokemon-blue dark:text-white' : 'bg-white dark:bg-[#223c2a] text-pokemon-red dark:text-pokemon-blue'" class="px-6 py-2 rounded-lg font-bold shadow border border-pokemon-red dark:border-pokemon-blue transition-colors">Pokémon</button>
          <button @click="activeTab = 'users'" :class="activeTab === 'users' ? 'bg-pokemon-red text-white dark:bg-pokemon-blue dark:text-white' : 'bg-white dark:bg-[#223c2a] text-pokemon-red dark:text-pokemon-blue'" class="px-6 py-2 rounded-lg font-bold shadow border border-pokemon-red dark:border-pokemon-blue transition-colors">Usuarios</button>
        </div>

        <!-- Gestión de Pokémon -->
        <div v-if="activeTab === 'pokemon'">
          <!-- Formulario para crear/editar Pokémon -->
          <div class="bg-white/90 dark:bg-[#223c2a]/90 shadow-lg rounded-3xl border-t-4 border-pokemon-red dark:border-pokemon-blue">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-pokemon-red dark:text-pokemon-blue">
                {{ editingPokemon ? 'Editar Pokémon' : 'Crear Nuevo Pokémon' }}
              </h3>
              <form @submit.prevent="handleSubmit" class="mt-5 space-y-6">
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Nombre</label>
                    <input
                      type="text"
                      id="name"
                      v-model="form.name"
                      required
                      class="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pokemon-blue dark:focus:ring-pokemon-red"
                    />
                  </div>

                  <div>
                    <label for="number" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Número</label>
                    <input
                      type="number"
                      id="number"
                      v-model="form.number"
                      required
                      class="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pokemon-blue dark:focus:ring-pokemon-red"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tipos</label>
                    <div class="flex flex-wrap gap-2 mb-1">
                      <label v-for="type in pokemonTypes" :key="type" class="flex items-center gap-1 px-2 py-1 rounded bg-[#eaf5c3] dark:bg-[#306230] text-[#0f380f] dark:text-[#9bbc0f] font-pixel cursor-pointer select-none transition-all border border-[#9bbc0f] dark:border-[#183c1a] hover:scale-105">
                        <input
                          type="checkbox"
                          :value="type"
                          v-model="form.types"
                          :disabled="form.types.length >= 2 && !form.types.includes(type)"
                          class="accent-[#9bbc0f] dark:accent-[#306230] w-4 h-4 rounded focus:ring-2 focus:ring-pokemon-blue dark:focus:ring-pokemon-red"
                        />
                        <span>{{ type }}</span>
                      </label>
                    </div>
                    <p v-if="form.types.length < 1 || form.types.length > 2" class="text-red-600 text-xs mt-1">Debes seleccionar 1 o 2 tipos.</p>
                  </div>

                  <div>
                    <label for="image" class="block text-sm font-medium text-gray-700 dark:text-gray-200">URL de Imagen</label>
                    <input
                      type="url"
                      id="image"
                      v-model="form.image"
                      required
                      class="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pokemon-blue dark:focus:ring-pokemon-red"
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Descripción</label>
                    <textarea
                      id="description"
                      v-model="form.description"
                      rows="3"
                      required
                      class="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pokemon-blue dark:focus:ring-pokemon-red"
                    ></textarea>
                  </div>

                  <div>
                    <label for="height" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Altura (m)</label>
                    <input
                      type="number"
                      id="height"
                      v-model="form.height"
                      step="0.1"
                      required
                      class="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pokemon-blue dark:focus:ring-pokemon-red"
                    />
                  </div>

                  <div>
                    <label for="weight" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Peso (kg)</label>
                    <input
                      type="number"
                      id="weight"
                      v-model="form.weight"
                      step="0.1"
                      required
                      class="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pokemon-blue dark:focus:ring-pokemon-red"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-6 sm:grid-cols-3">
                  <div v-for="(stat, key) in form.stats" :key="key">
                    <label :for="key" class="block text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">{{ key }}</label>
                    <input
                      type="number"
                      :id="key"
                      v-model="form.stats[key]"
                      min="0"
                      max="255"
                      required
                      class="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pokemon-blue dark:focus:ring-pokemon-red"
                    />
                  </div>
                </div>

                <div class="flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="resetForm"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pokemon-blue dark:focus:ring-pokemon-red"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="loading || form.types.length < 1 || form.types.length > 2"
                    :class="[
                      'px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold transition-colors duration-200',
                      (loading || form.types.length < 1 || form.types.length > 2)
                        ? 'bg-[#eaf5c3] text-[#0f380f] dark:bg-[#bada55] dark:text-[#0f380f] opacity-80 cursor-not-allowed'
                        : 'text-white bg-[#e53935] dark:bg-[#9bbc0f] dark:text-[#0f380f] hover:bg-[#b71c1c] dark:hover:bg-[#bada55] focus:ring-2 focus:ring-offset-2 focus:ring-pokemon-blue dark:focus:ring-[#9bbc0f]'
                    ]"
                  >
                    {{ loading ? 'Guardando...' : (editingPokemon ? 'Actualizar' : 'Crear') }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Tabla de Pokémon -->
          <div class="mt-8 bg-white/90 dark:bg-[#223c2a]/90 shadow-lg rounded-3xl p-6">
            <h3 class="text-lg font-bold mb-4 text-pokemon-red dark:text-pokemon-blue">Lista de Pokémon</h3>
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th class="px-4 py-2 text-left">Nombre</th>
                  <th class="px-4 py-2 text-left">Número</th>
                  <th class="px-4 py-2 text-left">Tipos</th>
                  <th class="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="poke in pokemonList" :key="poke._id" class="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <td class="px-4 py-2">{{ poke.name }}</td>
                  <td class="px-4 py-2">{{ poke.number }}</td>
                  <td class="px-4 py-2">{{ poke.types.join(', ') }}</td>
                  <td class="px-4 py-2 flex gap-2">
                    <button @click="editPokemon(poke)" class="px-2 py-1 bg-yellow-400 text-white rounded shadow">Editar</button>
                    <button @click="deletePokemon(poke._id)" class="px-2 py-1 bg-red-500 text-white rounded shadow">Eliminar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Gestión de Usuarios -->
        <div v-if="activeTab === 'users'">
          <div class="bg-white/90 dark:bg-[#223c2a]/90 shadow-lg rounded-3xl p-6">
            <h3 class="text-lg font-bold mb-4 text-pokemon-red dark:text-pokemon-blue">Lista de Usuarios</h3>
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th class="px-4 py-2 text-left">Nombre</th>
                  <th class="px-4 py-2 text-left">Email</th>
                  <th class="px-4 py-2 text-left">Rol</th>
                  <th class="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in userList" :key="user._id" class="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <td class="px-4 py-2 font-bold text-pokemon-red dark:text-pokemon-blue">{{ user.username ? user.username : 'Sin nombre' }}</td>
                  <td class="px-4 py-2">{{ user.email }}</td>
                  <td class="px-4 py-2">{{ user.role }}</td>
                  <td class="px-4 py-2 flex gap-2">
                    <button @click="editUser(user)" class="px-2 py-1 bg-yellow-400 text-white rounded shadow">Editar</button>
                    <button @click="deleteUser(user._id)" class="px-2 py-1 bg-red-500 text-white rounded shadow">Eliminar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="error" class="mt-4 bg-red-50 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative">
          {{ error }}
        </div>
      </main>
    </div>
  </div>

  <!-- MODAL USUARIO -->
  <template v-if="showUserModal">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white dark:bg-[#223c2a] rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
        <button @click="showUserModal = false" class="absolute top-2 right-2 text-2xl">×</button>
        <h2 class="text-xl font-bold mb-4 text-pokemon-red dark:text-pokemon-blue">{{ editingUser ? 'Editar Usuario' : 'Crear Usuario' }}</h2>
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium">Nombre de usuario</label>
            <input v-model="userForm.username" required class="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium">Email</label>
            <input v-model="userForm.email" type="email" required class="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium">Rol</label>
            <select v-model="userForm.role" class="w-full rounded border px-3 py-2">
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div v-if="!editingUser">
            <label class="block text-sm font-medium">Contraseña</label>
            <input v-model="userForm.password" type="password" required class="w-full rounded border px-3 py-2" />
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button type="button" @click="showUserModal = false" class="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded bg-pokemon-red text-white font-bold">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  </template>

  <!-- MODAL CONFIRMACIÓN ELIMINAR -->
  <template v-if="showDeleteModal">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white dark:bg-[#223c2a] rounded-2xl p-8 shadow-2xl w-full max-w-sm relative">
        <button @click="showDeleteModal = false" class="absolute top-2 right-2 text-2xl">×</button>
        <h2 class="text-xl font-bold mb-4 text-pokemon-red dark:text-pokemon-blue">¿Estás seguro?</h2>
        <p class="mb-6">Esta acción no se puede deshacer.</p>
        <div class="flex justify-end gap-2">
          <button @click="showDeleteModal = false" class="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700">Cancelar</button>
          <button @click="doDelete" class="px-4 py-2 rounded bg-red-600 text-white font-bold">Confirmar</button>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { usePokemonStore } from '../stores/pokemon';
import { useAuthStore } from '../stores/auth';
import { useRouter, RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';

const pokemon = usePokemonStore();
const auth = useAuthStore();
const router = useRouter();

const activeTab = ref('pokemon');

const pokemonTypes = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison',
  'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark',
  'Steel', 'Fairy'
];

const editingPokemon = ref(null);
const loading = ref(false);
const error = ref('');

const form = reactive({
  name: '',
  number: '',
  types: [],
  description: '',
  height: '',
  weight: '',
  image: '',
  stats: {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0
  }
});

const userList = ref([]);

watch(activeTab, async (tab) => {
  if (tab === 'users') {
    try {
      userList.value = await auth.getAllUsers();
    } catch (e) {
      // Manejar error si es necesario
    }
  }
}, { immediate: true });

const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (key === 'stats') {
      Object.keys(form.stats).forEach(stat => {
        form.stats[stat] = 0;
      });
    } else if (key === 'types') {
      form[key] = [];
    } else {
      form[key] = '';
    }
  });
  editingPokemon.value = null;
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    if (editingPokemon.value) {
      await pokemon.updatePokemon(editingPokemon.value._id, form);
    } else {
      await pokemon.createPokemon(form);
    }
    resetForm();
    router.push('/pokedex');
  } catch (e) {
    error.value = 'Error al guardar el Pokémon';
  } finally {
    loading.value = false;
  }
};

const pokemonList = computed(() => pokemon.pokemon);

const editPokemon = (poke) => {
  editingPokemon.value = poke;
  Object.assign(form, poke);
};

const deletePokemon = (id) => {
  confirmDelete('pokemon', id);
};

// --- MODALES Y ESTADO PARA USUARIOS ---
const showUserModal = ref(false);
const editingUser = ref(null);
const userForm = reactive({
  username: '',
  email: '',
  role: 'user',
  password: '' // Solo para crear
});
const showDeleteModal = ref(false);
const deleteTarget = ref(null);
const deleteType = ref(''); // 'pokemon' o 'user'

function openUserModal(user = null) {
  if (user) {
    editingUser.value = user;
    userForm.username = user.username;
    userForm.email = user.email;
    userForm.role = user.role;
    userForm.password = '';
  } else {
    editingUser.value = null;
    userForm.username = '';
    userForm.email = '';
    userForm.role = 'user';
    userForm.password = '';
  }
  showUserModal.value = true;
}

async function saveUser() {
  loading.value = true;
  try {
    if (editingUser.value) {
      await auth.updateUser(editingUser.value._id, {
        username: userForm.username,
        email: userForm.email,
        role: userForm.role
      });
    } else {
      await auth.createUser({
        username: userForm.username,
        email: userForm.email,
        role: userForm.role,
        password: userForm.password
      });
    }
    userList.value = await auth.getAllUsers();
    showUserModal.value = false;
  } catch (e) {
    error.value = 'Error al guardar usuario';
  } finally {
    loading.value = false;
  }
}

function confirmDelete(type, item) {
  deleteType.value = type;
  deleteTarget.value = item;
  showDeleteModal.value = true;
}

async function doDelete() {
  loading.value = true;
  try {
    if (deleteType.value === 'pokemon') {
      await pokemon.deletePokemon(deleteTarget.value);
    } else if (deleteType.value === 'user') {
      await auth.deleteUser(deleteTarget.value);
      userList.value = await auth.getAllUsers();
    }
    showDeleteModal.value = false;
  } catch (e) {
    error.value = 'Error al eliminar';
  } finally {
    loading.value = false;
  }
}

// --- FUNCIONES PARA BOTONES ---
const editUser = (user) => {
  openUserModal(user);
};
const deleteUser = (id) => {
  confirmDelete('user', id);
};
</script> 