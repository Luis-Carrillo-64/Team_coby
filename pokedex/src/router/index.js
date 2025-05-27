import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Componentes
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Pokedex from '../components/Pokedex.vue';
import AdminPanel from '../components/AdminPanel.vue';

const routes = [
  {
    path: '/',
    redirect: '/pokedex'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/pokedex',
    name: 'Pokedex',
    component: Pokedex,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  const isAuthenticated = auth.isAuthenticated;
  const isAdmin = auth.user?.role === 'admin';

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/pokedex');
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next('/pokedex');
  } else {
    next();
  }
});

export default router; 