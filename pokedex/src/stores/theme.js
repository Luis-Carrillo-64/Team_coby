import { defineStore } from 'pinia';

function getInitialTheme() {
  try {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || theme === 'light') return theme;
    // Si hay datos corruptos, limpiar
    localStorage.removeItem('theme');
    return 'light';
  } catch {
    return 'light';
  }
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: getInitialTheme(),
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