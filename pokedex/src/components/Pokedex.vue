<template>
  <div class="min-h-screen bg-[#9bbc0f] dark:bg-[#0f380f] relative overflow-x-hidden transition-colors duration-500">
    <!-- Game Boy Screen Effect -->
    <div class="absolute inset-0 bg-[#8bac0f] dark:bg-[#306230] opacity-20 pointer-events-none"></div>

    <!-- Indicadores de Carga y Error -->
    <div v-if="pokemonStore.loading" class="text-center text-gray-500 dark:text-gray-400 font-pixel text-xl">Cargando Pokémon...</div>
    <div v-else-if="pokemonStore.error" class="text-center text-red-500 dark:text-red-400 font-pixel text-xl">Error al cargar Pokémon: {{ pokemonStore.error }}</div>
    <div v-else-if="paginatedPokemonList.length === 0" class="text-center text-gray-600 dark:text-gray-300 font-pixel text-xl">No se encontraron Pokémon.</div>

    <!-- Grid de Pokémon -->
    <div v-else class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 p-2 sm:p-4 md:p-8 transition-all duration-300">
      <div
        v-for="pokemon in paginatedPokemonList"
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

    <!-- Paginación Mejorada (Solo en pestaña Todos) -->
    <div v-if="uiStore.activeTab === 'all'" class="flex justify-center pb-8">
      <nav class="relative z-0 inline-flex gap-2">
        <!-- Ir a la primera página -->
        <button
          :disabled="uiStore.currentPage === 1"
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
          :disabled="uiStore.currentPage === 1"
          @click="changePage(uiStore.currentPage - 1)"
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
              :class="uiStore.currentPage === page ? 'bg-[#0f380f] dark:bg-[#9bbc0f]' : 'bg-[#8bac0f] dark:bg-[#306230]'"
            >
              <span
                class="font-pixel text-sm"
                :class="uiStore.currentPage === page ? 'text-[#8bac0f] dark:text-[#306230]' : 'text-[#0f380f] dark:text-[#9bbc0f]'"
              >{{ page }}</span>
            </div>
          </button>
        </template>
        <!-- Página siguiente -->
        <button
          :disabled="uiStore.currentPage === totalPagesComputed"
          @click="changePage(uiStore.currentPage + 1)"
          class="relative group"
        >
          <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
          <div class="relative px-3 py-2 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f] bg-[#8bac0f] dark:bg-[#306230]">
            <span class="font-pixel text-[#0f380f] dark:text-[#9bbc0f] text-sm">›</span>
          </div>
        </button>
        <!-- Ir a la última página -->
        <button
          :disabled="uiStore.currentPage === totalPagesComputed"
          @click="changePage(totalPagesComputed)"
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
      <div v-if="selectedPokemon" class="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-8">
        <!-- Fondo difuminado y clickeable para cerrar -->
        <div class="absolute inset-0 bg-[#0f380f]/80 dark:bg-[#9bbc0f]/80 backdrop-blur-sm transition-all duration-300" @click="closeDetailsModal()"></div>
        <!-- Modal principal -->
        <div class="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border-4 border-[#bada55] dark:border-[#183c1a] bg-gradient-to-br from-[#f8ffe5] via-[#eaf5c3] to-[#bada55] dark:from-[#183c1a] dark:via-[#223c2a] dark:to-[#306230] p-2 sm:p-8 animate-slide-in-up transition-all duration-300">
          <!-- Botón de cerrar -->
          <button @click="closeDetailsModal()" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#e53935] dark:bg-[#9bbc0f] flex items-center justify-center border-4 border-white dark:border-[#183c1a] shadow-lg hover:scale-110 transition-transform z-10">
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
                <template v-if="pokeApiData && pokeApiData.moves && pokeApiData.moves.length <= 5">
                  <span v-for="m in pokeApiData.moves" :key="m.move.name" class="inline-block mx-1 px-2 py-1 rounded bg-[#bada55] dark:bg-[#183c1a] text-[#0f380f] dark:text-[#9bbc0f]">{{ m.move.name }}</span>
                </template>
                <template v-else-if="pokeApiData && pokeApiData.moves && pokeApiData.moves.length > 5">
                  <span v-for="m in (showAllMoves ? pokeApiData.moves : pokeApiData.moves.slice(0, 5))" :key="'modal-' + m.move.name" class="inline-block mx-1 px-2 py-1 rounded bg-[#bada55] dark:bg-[#183c1a] text-[#0f380f] dark:text-[#9bbc0f]">{{ m.move.name }}</span>
                  <button v-if="!showAllMoves" @click="showAllMoves = true" class="ml-2 px-3 py-1 rounded-full bg-[#9bbc0f] dark:bg-[#bada55] text-[#0f380f] dark:text-[#183c1a] font-bold shadow hover:scale-105 transition-transform">Ver todos</button>
                  <div v-if="showAllMoves" class="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    <span v-for="m in pokeApiData.moves" :key="'all-' + m.move.name" class="block px-2 py-1 rounded bg-[#bada55] dark:bg-[#183c1a] text-[#0f380f] dark:text-[#9bbc0f] text-center">{{ m.move.name }}</span>
                  </div>
                  <button v-if="showAllMoves" @click="showAllMoves = false" class="mt-2 px-3 py-1 rounded-full bg-[#e53935] dark:bg-[#9bbc0f] text-white dark:text-[#183c1a] font-bold shadow hover:scale-105 transition-transform">Mostrar menos</button>
                </template>
                 <span v-else>No se encontraron movimientos.</span>
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

    <!-- Modal de Filtros -->
    <Transition name="modal">
      <div v-if="uiStore.showFilters" class="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-8">
        <div class="absolute inset-0 bg-[#0f380f]/80 dark:bg-[#9bbc0f]/80 backdrop-blur-sm transition-all duration-300" @click="uiStore.toggleFilters()"></div>
        <div class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border-4 border-[#bada55] dark:border-[#183c1a] bg-gradient-to-br from-[#f8ffe5] via-[#eaf5c3] to-[#bada55] dark:from-[#183c1a] dark:via-[#223c2a] dark:to-[#306230] p-2 sm:p-8 animate-slide-in-up transition-all duration-300">
          <button @click="uiStore.toggleFilters()" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#e53935] dark:bg-[#9bbc0f] flex items-center justify-center border-4 border-white dark:border-[#183c1a] shadow-lg hover:scale-110 transition-transform z-10">
            <span class="text-white dark:text-[#183c1a] text-2xl font-bold">×</span>
          </button>

          <h2 class="text-2xl font-pixel text-[#0f380f] dark:text-[#9bbc0f] mb-6">Filtros</h2>

          <!-- Filtro por Letra -->
          <div class="mb-6">
            <h3 class="font-pixel text-lg text-[#0f380f] dark:text-[#9bbc0f] mb-3">Filtrar por Letra</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')"
                :key="letter"
                @click="uiStore.setFilterLetter(letter === uiStore.selectedLetter ? null : letter)"
                :class="uiStore.selectedLetter === letter ? 'bg-[#0f380f] dark:bg-[#9bbc0f] text-[#8bac0f] dark:text-[#306230]' : 'bg-[#8bac0f] text-[#0f380f] dark:bg-[#306230] dark:text-[#9bbc0f]'"
                class="w-10 h-10 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f] font-pixel hover:scale-110 transition-transform"
              >
                {{ letter }}
              </button>
            </div>
          </div>

          <!-- Filtro por Tipos -->
          <div class="mb-6">
            <h3 class="font-pixel text-lg text-[#0f380f] dark:text-[#9bbc0f] mb-3">Filtrar por Tipos</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <label
                v-for="type in Object.keys(typeColors)"
                :key="type"
                class="relative flex items-center p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-transform"
                :style="`background:${typeColors[type].bg};border-color:${typeColors[type].border};color:${typeColors[type].text}`"
              >
                <input
                  type="checkbox"
                  v-model="uiStore.selectedTypes"
                  :value="type"
                  class="sr-only"
                />
                <span class="font-pixel">{{ type }}</span>
                <div
                  v-if="uiStore.selectedTypes.includes(type)"
                  class="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                >
                  <Icon icon="mdi:check" class="w-3 h-3 text-[#0f380f]" />
                </div>
              </label>
            </div>
          </div>

          <!-- Filtro por Generación -->
          <div class="mb-6">
            <h3 class="font-pixel text-lg text-[#0f380f] dark:text-[#9bbc0f] mb-3">Filtrar por Generación</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <button
                v-for="gen in generations"
                :key="gen.name"
                @click="uiStore.setFilterGeneration(gen.name === uiStore.selectedGeneration ? null : gen.name)"
                :class="uiStore.selectedGeneration === gen.name ? 'bg-[#0f380f] dark:bg-[#9bbc0f] text-[#8bac0f] dark:text-[#306230]' : 'bg-[#8bac0f] text-[#0f380f] dark:bg-[#306230] dark:text-[#9bbc0f]'"
                class="p-3 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f] font-pixel hover:scale-105 transition-transform"
              >
                {{ gen.name }}
                <div class="text-sm opacity-75">{{ gen.range }}</div>
              </button>
            </div>
          </div>

          <!-- Filtro por Estadísticas -->
          <div class="mb-6">
            <h3 class="font-pixel text-lg text-[#0f380f] dark:text-[#9bbc0f] mb-3">Filtrar por Estadísticas</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="relative">
                <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
                <div class="relative bg-[#8bac0f] dark:bg-[#306230] p-4 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f]">
                  <select
                    v-model="uiStore.selectedStat"
                    class="w-full bg-transparent text-[#0f380f] dark:text-[#9bbc0f] font-pixel border-2 border-[#0f380f] dark:border-[#9bbc0f] rounded-lg p-2"
                  >
                    <option value="">Seleccionar estadística</option>
                    <option value="hp">HP</option>
                    <option value="attack">Ataque</option>
                    <option value="defense">Defensa</option>
                    <option value="specialAttack">Ataque Especial</option>
                    <option value="specialDefense">Defensa Especial</option>
                    <option value="speed">Velocidad</option>
                  </select>
                </div>
              </div>
              <div class="relative">
                <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
                <div class="relative bg-[#8bac0f] dark:bg-[#306230] p-4 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f]">
                  <select
                    v-model="uiStore.statOperator"
                    class="w-full bg-transparent text-[#0f380f] dark:text-[#9bbc0f] font-pixel border-2 border-[#0f380f] dark:border-[#9bbc0f] rounded-lg p-2"
                  >
                    <option value=">">Mayor que</option>
                    <option value="<">Menor que</option>
                    <option value="=">Igual a</option>
                  </select>
                </div>
              </div>
              <div class="relative md:col-span-2">
                <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
                <div class="relative bg-[#8bac0f] dark:bg-[#306230] p-4 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f]">
                  <input
                    type="number"
                    v-model="uiStore.statValue"
                    min="0"
                    max="255"
                    placeholder="Valor de la estadística"
                    class="w-full bg-transparent text-[#0f380f] dark:text-[#9bbc0f] font-pixel border-2 border-[#0f380f] dark:border-[#9bbc0f] rounded-lg p-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="flex justify-end gap-4">
            <button
              @click="uiStore.clearFilters()"
              class="relative group"
            >
              <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
              <div class="relative px-6 py-3 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f] bg-[#8bac0f] dark:bg-[#306230]">
                <span class="font-pixel text-[#0f380f] dark:text-[#9bbc0f]">Limpiar Filtros</span>
              </div>
            </button>
            <button
              @click="applyFilters()"
              class="relative group"
            >
              <div class="absolute -inset-1 bg-[#0f380f] dark:bg-[#9bbc0f] rounded-lg blur-sm opacity-75"></div>
              <div class="relative px-6 py-3 rounded-lg border-2 border-[#0f380f] dark:border-[#9bbc0f] bg-[#0f380f] dark:bg-[#9bbc0f]">
                <span class="font-pixel text-[#8bac0f] dark:text-[#306230]">Aplicar Filtros</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { usePokemonStore } from '@/stores/pokemon';
import { Icon } from '@iconify/vue';
import { getTypeColor } from '@/utils/pokemonUtils';
import axios from 'axios';

const auth = useAuthStore();
const uiStore = useUiStore();
const pokemonStore = usePokemonStore();

const selectedPokemon = ref(null);
const pokeApiData = ref(null);
const evolutionChain = ref([]);
const loadingFavoritos = ref(false);
const showAllMoves = ref(false);

const generations = ref([
  { name: 'Generación 1', range: '1-151' },
  { name: 'Generación 2', range: '152-251' },
  { name: 'Generación 3', range: '252-386' },
  { name: 'Generación 4', range: '387-493' },
  { name: 'Generación 5', range: '494-649' },
  { name: 'Generación 6', range: '650-721' },
  { name: 'Generación 7', range: '722-809' }
]);

const typeColors = {
  normal: { bg: '#A8A77A', border: '#8A8A59', text: '#FFFFFF' },
  fire: { bg: '#EE8160', border: '#CD5E44', text: '#FFFFFF' },
  water: { bg: '#6390F0', border: '#4569C0', text: '#FFFFFF' },
  electric: { bg: '#F7D02C', border: '#DBB50A', text: '#212121' },
  grass: { bg: '#7AC74C', border: '#5C9C36', text: '#FFFFFF' },
  ice: { bg: '#96D9D6', border: '#7EC3BE', text: '#212121' },
  fighting: { bg: '#C22E28', border: '#9C2321', text: '#FFFFFF' },
  poison: { bg: '#A33EA1', border: '#833380', text: '#FFFFFF' },
  ground: { bg: '#E2BF65', border: '#C5A54F', text: '#212121' },
  flying: { bg: '#A98FF3', border: '#8D76C3', text: '#212121' },
  psychic: { bg: '#F95587', border: '#D6416D', text: '#FFFFFF' },
  bug: { bg: '#A6B91A', border: '#8B9A14', text: '#FFFFFF' },
  rock: { bg: '#B6A136', border: '#9C8D2F', text: '#FFFFFF' },
  ghost: { bg: '#735797', border: '#5B4A77', text: '#FFFFFF' },
  dragon: { bg: '#6F35FC', border: '#571EBC', text: '#FFFFFF' },
  dark: { bg: '#705746', border: '#5A4539', text: '#FFFFFF' },
  steel: { bg: '#B7B7CE', border: '#9A9AB7', text: '#212121' },
  fairy: { bg: '#D685AD', border: '#B86C90', text: '#212121' }
};

onMounted(() => {
  if (auth.isAuthenticated) {
    auth.getFavorites().catch(err => console.error('Error fetching favorites on mount:', err));
  }

  // Cargar todos los Pokémon al montar el componente para tener la lista completa para evoluciones y favoritos
  pokemonStore.fetchAllPokemon().catch(err => console.error('Error fetching all pokemon on mount:', err));

  // Cargar la primera página de Pokémon con filtros iniciales
  pokemonStore.fetchPokemon(1, 12, uiStore.currentFilters).catch(err => console.error('Error fetching pokemon on mount:', err));
});

const paginatedPokemonList = computed(() => {
  if (uiStore.activeTab === 'favorites') {
    return pokemonStore.allPokemon.filter(p => auth.favorites.includes(p.name));
  } else {
    return pokemonStore.pokemon;
  }
});

const totalPagesComputed = computed(() => {
  if (uiStore.activeTab === 'favorites') {
    return 1; 
  } else {
    return pokemonStore.pagination.totalPages;
  }
});

const paginationRange = computed(() => {
  if (uiStore.activeTab !== 'all') return [];

  const total = totalPagesComputed.value;
  const current = uiStore.currentPage;
  const delta = 2;
  const range = [];
  let l = 1;
  let r = total;
  let breakPoint = 0;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      if (breakPoint + 1 < i) {
        range.push('...');
      }
      range.push(i);
      breakPoint = i;
    }
  }
  return range;
});

const changePage = (page) => {
  if (uiStore.activeTab !== 'all') return;

  uiStore.setCurrentPage(page);
  pokemonStore.fetchPokemon(page, 12, uiStore.currentFilters);
};

const viewDetails = async (pokemon) => {
  try {
    // 1. Llama a tu backend para disparar el tracking de logros
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/pokemon/${pokemon._id}`,
      {
        headers: { Authorization: `Bearer ${auth.token}` }
      }
    );
    // 2. Usa la respuesta del backend como fuente principal de datos
    selectedPokemon.value = response.data;

    // 3. (Opcional) Llama a la PokeAPI externa si quieres datos extra
    pokeApiData.value = null;
    evolutionChain.value = [];
    try {
      const pokeApiResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${selectedPokemon.value.number}`, {
        withCredentials: false
      });
      pokeApiData.value = pokeApiResponse.data;
      // ... resto de tu lógica para la PokeAPI ...
      if (!pokeApiData.value.moves) {
        pokeApiData.value.moves = [];
      }
      const speciesUrl = pokeApiData.value.species.url;
      const speciesResponse = await axios.get(speciesUrl, { withCredentials: false });
      const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
      const evolutionChainResponse = await axios.get(evolutionChainUrl, { withCredentials: false });
      let currentEvo = evolutionChainResponse.data.chain;
      const evoArray = [];
      async function processEvolutionChain(evolution) {
        if (!evolution) return;
        const evoSpeciesName = evolution.species.name;
        const pokeData = pokemonStore.allPokemon.find(p => p.name.toLowerCase() === evoSpeciesName.toLowerCase());
        let spriteUrl = pokeData ? pokeData.image : null;
        if (pokeData && pokeData.number) {
          try {
            const evoPokeApiResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokeData.number}`, { withCredentials: false });
            if (evoPokeApiResponse.data.sprites?.versions['generation-v']['black-white'].animated?.front_default) {
              spriteUrl = evoPokeApiResponse.data.sprites.versions['generation-v']['black-white'].animated.front_default;
            } else if (evoPokeApiResponse.data.sprites?.front_default) {
              spriteUrl = evoPokeApiResponse.data.sprites.front_default;
            } else if (evoPokeApiResponse.data.sprites?.other?.dream_world?.front_default) {
              spriteUrl = evoPokeApiResponse.data.sprites.other.dream_world.front_default;
            } else if (evoPokeApiResponse.data.sprites?.versions['generation-i']['pixel-pokemon']?.front_default) {
              spriteUrl = evoPokeApiResponse.data.sprites.versions['generation-i']['pixel-pokemon'].front_default;
            }
          } catch (apiError) {
            // Fallback to default spriteUrl
          }
        }
        evoArray.push({
          name: evoSpeciesName,
          sprite: spriteUrl
        });
        if (evolution.evolves_to && evolution.evolves_to.length > 0) {
          await Promise.all(evolution.evolves_to.map(evo => processEvolutionChain(evo)));
        }
      }
      await processEvolutionChain(currentEvo);
      evolutionChain.value = evoArray;
    } catch (err) {
      console.error('Error fetching PokeAPI data:', err);
      pokeApiData.value = null;
      evolutionChain.value = [];
    }
    showAllMoves.value = false;
  } catch (error) {
    console.error('Error cargando detalle de Pokémon desde backend:', error);
  }
};

const closeDetailsModal = () => {
  selectedPokemon.value = null;
  pokeApiData.value = null;
  evolutionChain.value = [];
  showAllMoves.value = false;
};

const isFavorite = computed(() => (pokemonName) => {
  return auth.favorites?.includes(pokemonName) || false;
});

const toggleFavorite = async (pokemonName) => {
  if (!auth.isAuthenticated) return; 

  loadingFavoritos.value = true;
  try {
    if (isFavorite.value(pokemonName)) {
      await auth.removeFavorite(pokemonName);
    } else {
      await auth.addFavorite(pokemonName);
    }
  } catch (err) {
    console.error('Error toggling favorite:', err);
  } finally {
    loadingFavoritos.value = false;
  }
};

const applyFilters = () => {
  if (uiStore.activeTab !== 'all') return;

  // Extraer solo el número de la generación si está seleccionada
  const generationNumber = uiStore.selectedGeneration ? uiStore.selectedGeneration.split(' ')[1] : null;

  // Actualizar los filtros en el store
  uiStore.setCurrentPage(1);
  
  // Usar los filtros actuales del store
  pokemonStore.fetchPokemon(1, 12, uiStore.currentFilters);
};

watch(() => uiStore.activeTab, (newTab) => {
  if (newTab === 'all') {
    pokemonStore.fetchPokemon(uiStore.currentPage, 12, uiStore.currentFilters);
  } else if (newTab === 'favorites') {
    if (auth.isAuthenticated) {
      if (!auth.favorites || auth.favorites.length === 0) {
        auth.getFavorites().catch(err => console.error('Error fetching favorites on tab change:', err));
      }
      if (!pokemonStore.allPokemon || pokemonStore.allPokemon.length === 0) {
         pokemonStore.fetchAllPokemon().catch(err => console.error('Error fetching all pokemon on tab change:', err));
      }
      uiStore.setCurrentPage(1);
    }
  }
});

watch(() => auth.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    try {
      await auth.getFavorites();
    } catch (err) {
      console.error('Error fetching favorites after auth state change:', err);
    }
  } else {
  }
});

const handleSearchInput = (value) => {
  uiStore.setSearchQuery(value);
};

watch(() => uiStore.searchQuery, (newQuery) => {
  // Aplicar filtro de búsqueda automáticamente al cambiar la consulta
  applyFilters();
});
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-active .animate-slide-in-up, .modal-leave-active .animate-slide-in-up {
  transition: all 0.3s ease;
}
.modal-enter-from .animate-slide-in-up, .modal-leave-to .animate-slide-in-up {
  transform: translateY(20px);
  opacity: 0;
}
.animate-bounce-subtle {
  animation: bounce-subtle 1s infinite alternate ease-in-out;
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Animaciones para los detalles del modal */
.animate-slide-in-left {
  animation: slide-in-left 0.5s ease-out;
}

.animate-slide-in-right {
  animation: slide-in-right 0.5s ease-out;
}

@keyframes slide-in-left {
  0% {
    transform: translateX(-20px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-in-right {
  0% {
    transform: translateX(20px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>