import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'light',
  }),
  actions: {
    setTheme(theme) {
      this.theme = theme;
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    },
    toggleTheme() {
      this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
    },
    initTheme() {
      this.setTheme(this.theme);
    }
  }
}); 