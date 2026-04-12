import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

// Páginas
import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Dashboard from '../pages/Dashboard.vue';
import AdminDashboard from '../pages/Admin/AdminDashboard.vue';
import ProductsManager from '../pages/Admin/ProductsManager.vue';
import OrdersManager from '../pages/Admin/OrdersManager.vue';
import UsersManager from '../pages/Admin/UsersManager.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/products',
    name: 'ProductsManager',
    component: ProductsManager,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/orders',
    name: 'OrdersManager',
    component: OrdersManager,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/users',
    name: 'UsersManager',
    component: UsersManager,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
  path: '/admin/config',
  name: 'AdminConfig',
  component: () => import('../pages/Admin/ConfigManager.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard de navegação - CORRIGIDO para sintaxe nova
router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();

  // Verificar autenticação ao carregar a página
  if (!authStore.user) {
    await authStore.checkAuth();
  }

  // Rota requer autenticação?
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login';
  }

  // Rota requer admin?
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return '/dashboard';
  }

  // Rota requer que NÃO esteja autenticado?
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return '/dashboard';
  }

  // Permitir navegação
  return true;
});

export default router;