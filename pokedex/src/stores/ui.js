import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    activeTab: 'all', // 'all', 'favorites', 'achievements'
    searchQuery: '',
    showFilters: false,
    selectedLetter: null,
    selectedTypes: [],
    selectedGeneration: null,
    selectedStat: '',
    statOperator: '>',
    statValue: null,
    currentPage: 1,
    itemsPerPage: 12,
    lastRoute: '/pokedex'
  }),
  getters: {
    currentFilters: (state) => {
      const generationNumber = state.selectedGeneration ? state.selectedGeneration.split(' ')[1] : null;
      return {
        search: state.searchQuery,
        letter: state.selectedLetter,
        types: state.selectedTypes,
        generation: generationNumber,
        stat: state.selectedStat,
        statOp: state.statOperator,
        statValue: state.statValue
      };
    }
  },
  actions: {
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    setSearchQuery(query) {
      this.searchQuery = query;
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    setFilterLetter(letter) {
      this.selectedLetter = letter;
    },
    setFilterTypes(types) {
      this.selectedTypes = types;
    },
    setFilterGeneration(generation) {
      this.selectedGeneration = generation;
    },
    setFilterStat(stat) {
      this.selectedStat = stat;
    },
    setStatOperator(operator) {
      this.statOperator = operator;
    },
    setStatValue(value) {
      this.statValue = value;
    },
    setCurrentPage(page) {
      this.currentPage = page;
    },
    setLastRoute(route) {
      this.lastRoute = route;
    },
    clearFilters() {
      this.selectedLetter = null;
      this.selectedTypes = [];
      this.selectedGeneration = null;
      this.selectedStat = '';
      this.statOperator = '>';
      this.statValue = null;
      this.currentPage = 1;
    },
    resetState() {
      this.activeTab = 'all';
      this.searchQuery = '';
      this.showFilters = false;
      this.clearFilters();
    }
  },
  persist: true
}); 