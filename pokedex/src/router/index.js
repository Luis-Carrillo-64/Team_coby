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
    meta: { 
      requiresGuest: true,
      title: 'Iniciar Sesión'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      requiresGuest: true,
      title: 'Registro'
    }
  },
  {
    path: '/pokedex',
    name: 'Pokedex',
    component: Pokedex,
    meta: { 
      requiresAuth: true,
      title: 'Pokédex'
    }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { 
      requiresAuth: true, 
      requiresAdmin: true,
      title: 'Panel de Administración'
    }
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: () => import('../views/AchievementsView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Logros'
    }
  },
  // Ruta para manejar 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/pokedex'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Middleware global para manejar la autenticación
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