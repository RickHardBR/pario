<template>
  <header class="header">
    <div class="header__container">
      <!-- Logo -->
      <router-link to="/" class="header__logo">
        <div>
          <img src="../../../src/assets/images/logo3orange.png" alt="Logo Parió na cor laranja" />
        </div>
      </router-link>

      <!-- Navegação Desktop -->
      <nav class="header__nav" :class="{ 'header__nav--open': menuOpen }">
        <router-link v-if="!authStore.isAuthenticated" to="/login" class="nav-link" @click="menuOpen = false">
          Entrar
        </router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/register" class="nav-link" @click="menuOpen = false">
          Cadastro
        </router-link>

        <div v-if="authStore.isAuthenticated && authStore.userProfile" class="user-menu">
          <span class="user-name">{{ authStore.userProfile.name || 'Usuário' }}</span>
          <router-link to="/dashboard" class="nav-link" @click="menuOpen = false">Perfil</router-link>
          <router-link v-if="authStore.isAdmin" to="/admin" class="nav-link admin-link" @click="menuOpen = false">
            Admin
          </router-link>
          <button @click="handleLogout" class="nav-link logout-btn">Sair</button>
        </div>
      </nav>

      <!-- Ações à direita -->
      <div class="header__actions">
        <!-- Botão do Carrinho com Badge -->
        <button class="cart-button" @click="openCart" :class="{ 'cart-button--active': cartStore.itemCount > 0 }">
          <span class="cart-icon">🛒</span>
          <span class="cart-label">Carrinho</span>
          <span v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</span>
        </button>

        <!-- Botão Hamburguer (Mobile) -->
        <button class="hamburger" @click="menuOpen = !menuOpen" :class="{ 'hamburger--open': menuOpen }" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <!-- Overlay para fechar menu no mobile -->
    <div v-if="menuOpen" class="menu-overlay" @click="menuOpen = false"></div>

    <!-- Modal do Carrinho -->
    <CartModal :is-open="isCartOpen" @close="closeCart" />
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import CartModal from '../Cart/CartModal.vue';

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const isCartOpen = ref(false);
const menuOpen = ref(false);

const openCart = () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  isCartOpen.value = true;
  menuOpen.value = false;
};

const closeCart = () => {
  isCartOpen.value = false;
};

const handleLogout = async () => {
  await authStore.logout();
  menuOpen.value = false;
  router.push('/');
};

onMounted(() => {
  if (!authStore.user) {
    authStore.checkAuth();
  }

  // Listener global para abrir carrinho via evento
  window.addEventListener('openCart', openCart);
});
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 900;
}

.header__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* Logo */
.header__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.header__logo img {
  height: 36px;
  width: auto;
}

.header__logo p {
  font-size: 13px;
  font-weight: 600;
  color: #D4511A;
  margin: 0;
  white-space: nowrap;
}

/* Navegação */
.header__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  padding: 8px 14px;
  text-decoration: none;
  color: #2C2C2C;
  font-weight: 600;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #D4511A;
  background-color: rgba(212, 81, 26, 0.06);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-name {
  font-size: 13px;
  color: #666;
  font-weight: 600;
  padding: 0 8px;
  white-space: nowrap;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-link {
  background: linear-gradient(135deg, #FFD700 0%, #E6C200 100%);
  color: #1A1A1A !important;
  font-size: 12px;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

/* Ações à direita */
.header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Botão do Carrinho */
.cart-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #FFD700 0%, #E6C200 100%);
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: #1A1A1A;
}

.cart-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 81, 26, 0.25);
}

.cart-icon {
  font-size: 16px;
}

.cart-label {
  white-space: nowrap;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #D4511A;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  animation: popIn 0.2s ease;
}

@keyframes popIn {
  from { transform: scale(0.5); }
  to { transform: scale(1); }
}

/* Hamburguer */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.hamburger:hover {
  background: rgba(212, 81, 26, 0.08);
}

.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: #2C2C2C;
  border-radius: 2px;
  transition: all 0.3s;
}

.hamburger--open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger--open span:nth-child(2) {
  opacity: 0;
}

.hamburger--open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Overlay mobile */
.menu-overlay {
  display: none;
  position: fixed;
  inset: 60px 0 0 0;
  background: rgba(0,0,0,0.3);
  z-index: 850;
}

/* Mobile */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .cart-label {
    display: none;
  }

  .cart-button {
    padding: 8px 10px;
  }

  .header__nav {
    display: none;
    position: fixed;
    top: 60px;
    right: 0;
    width: 260px;
    max-height: calc(100vh - 60px);
    overflow-y: auto;
    background: #FFFFFF;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    box-shadow: -4px 0 20px rgba(0,0,0,0.12);
    z-index: 900;
    gap: 4px;
  }

  .header__nav--open {
    display: flex;
  }

  .menu-overlay {
    display: block;
  }

  .user-menu {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    gap: 4px;
  }

  .user-name {
    padding: 8px 14px;
    max-width: 100%;
    font-size: 14px;
    color: #D4511A;
  }

  .nav-link {
    width: 100%;
  }
}
</style>