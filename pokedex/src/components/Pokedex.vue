<template>
  <div class="min-h-screen bg-[#9bbc0f] dark:bg-[#0f380f] relative overflow-x-hidden transition-colors duration-500">
    <!-- Game Boy Screen Effect -->
    <div class="absolute inset-0 bg-[#8bac0f] dark:bg-[#306230] opacity-20 pointer-events-none"></div>

    <!-- Tabs para ver todos o solo favoritos -->
    <div v-if="auth.isAuthenticated" class="flex justify-center mt-6 mb-2 gap-4">
      <button
        @click="activeTab = 'all'"
        :class="activeTab === 'all' ? 'bg-pokemon-red text-white dark:bg-pokemon-blue dark:text-white' : 'bg-white dark:bg-[#223c2a] text-pokemon-red dark:text-pokemon-blue'"
        class="px-6 py-2 rounded-lg font-bold shadow border border-pokemon-red dark:border-pokemon-blue transition-colors"
      >
        Todos
      </button>
      <button
        @click="activeTab = 'favorites'"
        :class="activeTab === 'favorites' ? 'bg-pokemon-red text-white dark:bg-pokemon-blue dark:text-white' : 'bg-white dark:bg-[#223c2a] text-pokemon-red dark:text-pokemon-blue'"
        class="px-6 py-2 rounded-lg font-bold shadow border border-pokemon-red dark:border-pokemon-blue transition-colors"
      >
        Mis Favoritos
      </button>
    </div>

    <!-- Barra de búsqueda -->
    <div class="flex justify-center mt-6 px-4">
      <div class="relative w-full max-w-xl">
        <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
        <div class="relative flex">
          <input
            type="text"
            v-model="searchQuery"
            @input="handleSearch"
            placeholder="Buscar Pokémon..."
            class="w-full py-3 pl-5 pr-12 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f] bg-[#8bac0f] dark:bg-[#306230] text-[#0f380f] dark:text-[#9bbc0f] font-pixel text-sm placeholder-[#0f380f] dark:placeholder-[#9bbc0f] placeholder-opacity-50"
          />
          <div v-if="loading" class="absolute right-3 top-1/2 -translate-y-1/2">
            <svg class="animate-spin h-5 w-5 text-[#0f380f] dark:text-[#9bbc0f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid de Pokémon -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-8">
      <div
        v-for="pokemon in filteredPokemonList"
        :key="pokemon._id"
        class="relative group"
      >
        <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
        <div class="relative bg-[#8bac0f] dark:bg-[#306230] rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f] p-4 flex flex-col justify-between min-h-[200px]">
          <button
            v-if="auth.isAuthenticated"
            @click.stop="toggleFavorite(pokemon.name)"
            :aria-label="isFavorite(pokemon.name) ? 'Quitar de favoritos' : 'Agregar a favoritos'"
            class="absolute bottom-3 right-3 z-10 focus:outline-none bg-white/80 dark:bg-[#223c2a]/80 rounded-full shadow-lg p-1 border-2 border-[#e53935] dark:border-[#9bbc0f] hover:scale-110 transition-transform"
            :disabled="loadingFavoritos"
            style="backdrop-filter: blur(2px);"
          >
            <Icon
              :icon="isFavorite(pokemon.name) ? 'mdi:heart' : 'mdi:heart-outline'"
              width="28"
              height="28"
              :class="isFavorite(pokemon.name) ? 'text-[#e53935] drop-shadow' : 'text-gray-400 dark:text-gray-600'"
            />
          </button>
          <div class="flex justify-between items-start">
            <div class="flex gap-2">
              <span v-for="type in pokemon.types" :key="type"
                class="px-2 py-1 rounded-lg text-base font-pixel border mr-1"
                :style="`background:${getTypeColor(type).bg};border-color:${getTypeColor(type).border};color:${getTypeColor(type).text}`"
              >
                {{ type }}
              </span>
            </div>
            <span class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-base ml-2">#{{ pokemon.number }}</span>
          </div>
          <div class="flex flex-row items-center justify-between mt-2 gap-4">
            <div class="flex-1">
              <h2 class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-3xl mb-2">{{ pokemon.name }}</h2>
              <p class="text-[#0f380f] dark:text-[#9bbc0f] text-lg mb-4 opacity-75 font-pixel leading-tight">{{ pokemon.description }}</p>
              <button 
                @click="viewDetails(pokemon)"
                class="relative group"
              >
                <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative bg-[#8bac0f] dark:bg-[#306230] px-4 py-2 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f]">
                  <span class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-base">VER MÁS</span>
                </div>
              </button>
            </div>
            <img :src="pokemon.image" :alt="pokemon.name" class="w-32 h-32 object-contain animate-bounce-subtle" />
          </div>
        </div>
      </div>
    </div>

<<<<<<< Updated upstream
    <!-- Paginación -->
    <div v-if="activeTab === 'all'" class="flex justify-center pb-8">
=======
    <!-- Paginación Mejorada -->
    <div class="flex justify-center pb-8">
>>>>>>> Stashed changes
      <nav class="relative z-0 inline-flex gap-2">
        <!-- Ir a la primera página -->
        <button
          :disabled="currentPage === 1"
          @click="changePage(1)"
          class="relative group"
        >
          <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
          <div class="relative px-3 py-2 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f] bg-[#8bac0f] dark:bg-[#306230]">
            <span class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-sm">«</span>
          </div>
        </button>
        <!-- Página anterior -->
        <button
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
          class="relative group"
        >
          <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
          <div class="relative px-3 py-2 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f] bg-[#8bac0f] dark:bg-[#306230]">
            <span class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-sm">‹</span>
          </div>
        </button>
        <!-- Números de página con puntos suspensivos -->
        <template v-for="page in paginationRange" :key="page">
          <span v-if="page === '...'" class="px-3 py-2 font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-lg">...</span>
          <button
            v-else
            @click="changePage(page)"
            class="relative group"
          >
            <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
            <div
              class="relative px-4 py-2 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f]"
              :class="currentPage === page ? 'bg-[#0f380f] dark:bg-[#9bbc0f]' : 'bg-[#8bac0f] dark:bg-[#306230]'"
            >
              <span
                class="font-pixel text-sm"
                :class="currentPage === page ? 'text-[#8bac0f] dark:text-[#306230]' : 'text-[#0f380f] dark:text-[#9bbc0f]'"
              >{{ page }}</span>
            </div>
          </button>
        </template>
        <!-- Página siguiente -->
        <button
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
          class="relative group"
        >
          <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
          <div class="relative px-3 py-2 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f] bg-[#8bac0f] dark:bg-[#306230]">
            <span class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-sm">›</span>
          </div>
        </button>
        <!-- Ir a la última página -->
        <button
          :disabled="currentPage === totalPages"
          @click="changePage(totalPages)"
          class="relative group"
        >
          <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
          <div class="relative px-3 py-2 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f] bg-[#8bac0f] dark:bg-[#306230]">
            <span class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-sm">»</span>
          </div>
        </button>
      </nav>
    </div>

    <!-- Modal de detalles -->
    <Transition name="modal">
      <div v-if="selectedPokemon" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Fondo difuminado y clickeable para cerrar -->
        <div class="absolute inset-0 bg-[#0f380f]/80 dark:bg-[#9bbc0f]/80 backdrop-blur-sm transition-all duration-300" @click="selectedPokemon = null"></div>
        <!-- Modal principal -->
        <div class="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border-4 border-[#bada55] dark:border-[#183c1a] bg-gradient-to-br from-[#f8ffe5] via-[#eaf5c3] to-[#bada55] dark:from-[#183c1a] dark:via-[#223c2a] dark:to-[#306230] p-8 animate-slide-in-up">
          <!-- Botón de cerrar -->
          <button @click="selectedPokemon = null" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#e53935] dark:bg-[#9bbc0f] flex items-center justify-center border-4 border-white dark:border-[#183c1a] shadow-lg hover:scale-110 transition-transform z-10">
            <span class="text-white dark:text-[#183c1a] text-2xl font-bold">×</span>
          </button>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Columna izquierda -->
            <div class="flex flex-col items-center animate-slide-in-left">
              <img 
                :src="selectedPokemon.image" 
                :alt="selectedPokemon.name"
                class="w-40 h-40 object-contain mb-4 animate-bounce-subtle"
              />
              <h2 class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-3xl mb-2">{{ selectedPokemon.name }}</h2>
              <div class="flex gap-2 mb-2">
                <span 
                  v-for="type in selectedPokemon.types" 
                  :key="type"
                  class="px-3 py-1 rounded-lg text-base font-pixel border mr-1"
                  :style="`background:${getTypeColor(type).bg};border-color:${getTypeColor(type).border};color:${getTypeColor(type).text}`"
                >
                  {{ type }}
                </span>
              </div>
              <span class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-base ml-2">#{{ selectedPokemon.number }}</span>
            </div>

            <!-- Columna derecha -->
            <div class="space-y-4 animate-slide-in-right">
              <p class="text-[#0f380f] dark:text-[#9bbc0f] text-lg font-pixel leading-tight mb-4">{{ selectedPokemon.description }}</p>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="relative">
                  <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
                  <div class="relative bg-[#8bac0f] dark:bg-[#306230] p-3 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f]">
                    <span class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-base">Altura: {{ selectedPokemon.height }}m</span>
                  </div>
                </div>
                <div class="relative">
                  <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
                  <div class="relative bg-[#8bac0f] dark:bg-[#306230] p-3 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f]">
                    <span class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-base">Peso: {{ selectedPokemon.weight }}kg</span>
                  </div>
                </div>
              </div>

              <div v-if="selectedPokemon.stats">
                <h3 class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-lg mb-2">Estadísticas:</h3>
                <div class="grid grid-cols-2 gap-2">
                  <div v-for="(value, key) in selectedPokemon.stats" :key="key" class="relative">
                    <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
                    <div class="relative bg-[#8bac0f] dark:bg-[#306230] p-2 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f]">
                      <div class="flex items-center justify-between">
                        <span class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-base">{{ key }}</span>
                        <span class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-base">{{ value }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-2">
                <span class="font-bold">Movimientos:</span>
                <template v-if="pokeApiData.moves.length <= 5">
                  <span v-for="m in pokeApiData.moves" :key="m.move.name" class="inline-block mx-1 px-2 py-1 rounded bg-[#bada55] dark:bg-[#183c1a] text-[#0f380f] dark:text-[#9bbc0f]">{{ m.move.name }}</span>
                </template>
                <template v-else>
                  <span v-for="m in (showAllMoves ? pokeApiData.moves : pokeApiData.moves.slice(0, 5))" :key="m.move.name" class="inline-block mx-1 px-2 py-1 rounded bg-[#bada55] dark:bg-[#183c1a] text-[#0f380f] dark:text-[#9bbc0f]">{{ m.move.name }}</span>
                  <button v-if="!showAllMoves" @click="showAllMoves = true" class="ml-2 px-3 py-1 rounded-full bg-[#9bbc0f] dark:bg-[#bada55] text-[#0f380f] dark:text-[#183c1a] font-bold shadow hover:scale-105 transition-transform">Ver todos</button>
                  <div v-if="showAllMoves" class="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    <span v-for="m in pokeApiData.moves" :key="'all-' + m.move.name" class="block px-2 py-1 rounded bg-[#bada55] dark:bg-[#183c1a] text-[#0f380f] dark:text-[#9bbc0f] text-center">{{ m.move.name }}</span>
                  </div>
                  <button v-if="showAllMoves" @click="showAllMoves = false" class="mt-2 px-3 py-1 rounded-full bg-[#e53935] dark:bg-[#9bbc0f] text-white dark:text-[#183c1a] font-bold shadow hover:scale-105 transition-transform">Mostrar menos</button>
                </template>
              </div>
            </div>
          </div>
          <!-- Información extra de la PokeAPI -->
          <div v-if="pokeApiData" class="mt-6 p-4 rounded-xl bg-white/80 dark:bg-[#183c1a]/80 border border-[#9bbc0f] dark:border-[#0f380f]">
            <h3 class="font-pixel text-lg text-pokemon-red dark:text-pokemon-blue mb-2">Datos de la PokeAPI</h3>
            <div class="flex flex-wrap gap-4 items-center mb-4">
              <img v-if="pokeApiData.sprites?.versions['generation-v']['black-white'].animated.front_default" :src="pokeApiData.sprites.versions['generation-v']['black-white'].animated.front_default" alt="sprite animado" class="w-20 h-20" />
              <img v-else-if="pokeApiData.sprites?.front_default" :src="pokeApiData.sprites.front_default" alt="sprite" class="w-20 h-20" />
            </div>
            <div class="mb-2">
              <span class="font-bold">Habilidades:</span>
              <span v-for="a in pokeApiData.abilities" :key="a.ability.name" class="inline-block mx-1 px-2 py-1 rounded bg-[#eaf5c3] dark:bg-[#306230] text-[#0f380f] dark:text-[#9bbc0f]">{{ a.ability.name }}</span>
            </div>
            <div class="mb-2">
              <span class="font-bold">Estadísticas base:</span>
              <span v-for="stat in pokeApiData.stats" :key="stat.stat.name" class="inline-block mx-1 px-2 py-1 rounded bg-[#8bac0f] dark:bg-[#306230] text-[#0f380f] dark:text-[#9bbc0f]">{{ stat.stat.name }}: {{ stat.base_stat }}</span>
            </div>
          </div>
          <div v-if="evolutionChain.length > 1" class="mt-6 p-4 rounded-xl bg-white/80 dark:bg-[#183c1a]/80 border border-[#bada55] dark:border-[#bada55]">
            <h3 class="font-pixel text-lg text-pokemon-red dark:text-pokemon-blue mb-2">Cadena de Evolución</h3>
            <div class="flex flex-wrap items-center gap-4 justify-center">
              <template v-for="(evo, idx) in evolutionChain" :key="evo.name">
                <div class="flex flex-col items-center">
                  <img v-if="evo.sprite" :src="evo.sprite" :alt="evo.name" class="w-16 h-16 mb-1" />
                  <span class="font-pixel text-xs capitalize text-[#0f380f] dark:text-[#9bbc0f]">{{ evo.name }}</span>
                </div>
                <span v-if="idx < evolutionChain.length - 1" class="mx-2 text-2xl font-bold text-[#bada55]">→</span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { usePokemonStore } from '../stores/pokemon';
import { useDebounceFn } from '@vueuse/core';
import { Icon } from '@iconify/vue';

const auth = useAuthStore();
const pokemon = usePokemonStore();

const searchQuery = ref('');
const selectedPokemon = ref(null);
const pokeApiData = ref(null);
const evolutionChain = ref([]);
const showCreateModal = ref(false);
const currentPage = ref(1);
const itemsPerPage = 12;
const showAllMoves = ref(false);
const activeTab = ref('all');

const isAdmin = computed(() => auth.user?.role === 'admin');
const pokemonList = computed(() => pokemon.pokemon);
const loading = computed(() => pokemon.loading);
const totalPages = computed(() => pokemon.pagination.totalPages);

const newPokemon = ref({
  name: '',
  number: '',
  types: '',
  description: '',
  height: '',
  weight: '',
  image: ''
});

// FAVORITOS
const favoritos = ref([]);
const loadingFavoritos = ref(false);

const isFavorite = (pokemonName) => favoritos.value.includes(pokemonName);

const toggleFavorite = async (pokemonName) => {
  if (!auth.isAuthenticated) return;
  loadingFavoritos.value = true;
  try {
    if (isFavorite(pokemonName)) {
      await auth.removeFavorite(pokemonName);
    } else {
      await auth.addFavorite(pokemonName);
    }
    favoritos.value = await auth.getFavorites();
    if (activeTab.value === 'favorites') {
      await pokemon.fetchAllPokemon();
    }
  } catch (e) {}
  loadingFavoritos.value = false;
};

// Colores por tipo de Pokémon
const typeColors = {
  Grass: { bg: '#78C850', border: '#4E8234', text: '#1B2E13' },
  Poison: { bg: '#A040A0', border: '#682A68', text: '#fff' },
  Fire: { bg: '#F08030', border: '#9C531F', text: '#fff' },
  Water: { bg: '#6890F0', border: '#445E9C', text: '#fff' },
  Electric: { bg: '#F8D030', border: '#A1871F', text: '#1B1B13' },
  Bug: { bg: '#A8B820', border: '#6D7815', text: '#1B2E13' },
  Normal: { bg: '#A8A878', border: '#6D6D4E', text: '#1B1B13' },
  Flying: { bg: '#A890F0', border: '#6D5E9C', text: '#1B1B13' },
  Ground: { bg: '#E0C068', border: '#927D44', text: '#1B1B13' },
  Fairy: { bg: '#EE99AC', border: '#9B6470', text: '#1B1B13' },
  Fighting: { bg: '#C03028', border: '#7D1F1A', text: '#fff' },
  Psychic: { bg: '#F85888', border: '#A13959', text: '#fff' },
  Rock: { bg: '#B8A038', border: '#786824', text: '#1B1B13' },
  Steel: { bg: '#B8B8D0', border: '#787887', text: '#1B1B13' },
  Ice: { bg: '#98D8D8', border: '#638D8D', text: '#1B1B13' },
  Ghost: { bg: '#705898', border: '#493963', text: '#fff' },
  Dragon: { bg: '#7038F8', border: '#4924A1', text: '#fff' },
  Dark: { bg: '#705848', border: '#49392F', text: '#fff' },
};

const getTypeColor = (type) => {
  return typeColors[type] || { bg: '#A8A878', border: '#6D6D4E', text: '#1B1B13' };
};

const handleSearch = useDebounceFn(async () => {
  if (searchQuery.value) {
    await pokemon.searchPokemon(searchQuery.value);
  } else {
    await fetchPokemon();
  }
}, 300);

const fetchPokemon = async () => {
  await pokemon.fetchPokemon(currentPage.value, itemsPerPage);
};

const changePage = async (page) => {
  currentPage.value = page;
  await fetchPokemon();
};

async function fetchPokeApiData(pokemon) {
  pokeApiData.value = null;
  try {
    // Buscar por nombre en minúsculas (la PokeAPI es case sensitive)
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name.toLowerCase()}`);
    if (!res.ok) return;
    const data = await res.json();
    pokeApiData.value = data;
  } catch (e) {
    pokeApiData.value = null;
  }
}

async function fetchEvolutionChain(pokemon) {
  evolutionChain.value = [];
  try {
    // 1. Obtener especie
    const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.name.toLowerCase()}`);
    if (!resSpecies.ok) return;
    const species = await resSpecies.json();
    // 2. Obtener la cadena de evolución
    const evoUrl = species.evolution_chain.url;
    const resEvo = await fetch(evoUrl);
    if (!resEvo.ok) return;
    const evoData = await resEvo.json();
    // 3. Recorrer la cadena
    let chain = [];
    let current = evoData.chain;
    while (current) {
      chain.push(current.species.name);
      if (current.evolves_to && current.evolves_to.length > 0) {
        current = current.evolves_to[0];
      } else {
        current = null;
      }
    }
    // 4. Obtener sprites de cada etapa
    const sprites = await Promise.all(chain.map(async name => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!res.ok) return { name, sprite: null };
        const data = await res.json();
        return { name, sprite: data.sprites.front_default };
      } catch { return { name, sprite: null }; }
    }));
    evolutionChain.value = sprites;
  } catch (e) {
    evolutionChain.value = [];
  }
}

const viewDetails = async (pokemon) => {
  selectedPokemon.value = pokemon;
  await fetchPokeApiData(pokemon);
  await fetchEvolutionChain(pokemon);
};

const editPokemon = (pokemon) => {
  // Implementar lógica de edición
};

const deletePokemon = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar este Pokémon?')) {
    await pokemon.deletePokemon(id);
    await fetchPokemon();
  }
};

const handleCreatePokemon = async () => {
  const pokemonData = {
    ...newPokemon.value,
    types: newPokemon.value.types.split(',').map(type => type.trim())
  };
  await pokemon.createPokemon(pokemonData);
  showCreateModal.value = false;
  await fetchPokemon();
};

const filteredPokemonList = computed(() => {
  if (activeTab.value === 'favorites' && auth.isAuthenticated) {
    const favs = favoritos.value.map(f => f.toLowerCase());
    return pokemon.pokemon.filter(p => favs.includes(p.name.toLowerCase()));
  }
  return pokemonList.value;
});

<<<<<<< Updated upstream
watch(activeTab, async (newTab) => {
  if (newTab === 'favorites' && auth.isAuthenticated) {
    favoritos.value = await auth.getFavorites();
    await pokemon.fetchAllPokemon();
  } else if (newTab === 'all') {
    await fetchPokemon();
  }
=======
const paginationRange = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2; // Cuántas páginas mostrar a cada lado
  const range = [];
  let l = Math.max(2, current - delta);
  let r = Math.min(total - 1, current + delta);

  range.push(1);
  if (l > 2) {
    range.push('...');
  }
  for (let i = l; i <= r; i++) {
    range.push(i);
  }
  if (r < total - 1) {
    range.push('...');
  }
  if (total > 1) {
    range.push(total);
  }
  return range;
>>>>>>> Stashed changes
});

onMounted(async () => {
  await fetchPokemon();
  if (auth.isAuthenticated) {
    favoritos.value = await auth.getFavorites();
  }
});
</script>

<style>
/* Animaciones */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.animate-slide-in-left {
  animation: slideInLeft 0.5s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.5s ease-out;
}

.animate-bounce-subtle {
  animation: bounceSubtle 2s infinite;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounceSubtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style> 