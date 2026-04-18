<template>
  <div class="admin-dashboard">
    <!-- Cabeçalho do Painel Administrativo -->
    <header class="admin-header">
      <div class="admin-header-content">
        <h1 class="admin-title">Painel Administrativo Goodfellas</h1>
        <div class="user-info">
          <span v-if="authStore.userProfile" class="user-name">
            Olá, <strong>{{ authStore.userProfile.name || authStore.userProfile.email }}</strong>
          </span>
          <button @click="handleLogout" class="btn btn--logout">
            Sair <span class="icon">🚪</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Conteúdo Principal do Painel -->
    <div class="admin-main-content">
      <!-- Navegação por Abas (Sidebar) -->
<nav class="admin-tabs">
  <button @click="activeTab = 'products'" :class="{ active: activeTab === 'products' }" class="tab-btn">
    <span class="icon">📦</span> Produtos
  </button>
  <button @click="activeTab = 'orders'" :class="{ active: activeTab === 'orders' }" class="tab-btn">
    <span class="icon">📋</span> Pedidos
  </button>
  <button @click="activeTab = 'destaques'" :class="{ active: activeTab === 'destaques' }" class="tab-btn">
    <span class="icon">⭐</span> Destaques
  </button>
  <button @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }" class="tab-btn">
    <span class="icon">👥</span> Usuários
  </button>
  <!-- NOVO BOTÃO DE CONFIGURAÇÕES -->
  <button @click="activeTab = 'config'" :class="{ active: activeTab === 'config' }" class="tab-btn">
    <span class="icon">⚙️</span> Configurações
  </button>
  <button @click="activeTab = 'stock'" :class="{ active: activeTab === 'stock' }" class="tab-btn">
    <span class="icon">⚠️</span> Estoque
  </button>
  <button @click="activeTab = 'sabores'" :class="{ active: activeTab === 'sabores' }" class="tab-btn">
    <span class="icon">🍹</span> Sabores
  </button>
</nav>

      <!-- Área de Conteúdo Dinâmico -->
      <div class="admin-content-area">
        <ProductsManager v-if="activeTab === 'products'" />
        <OrdersManager v-if="activeTab === 'orders'" />
        <UsersManager v-if="activeTab === 'users'" />
        <DestaquesManager v-if="activeTab === 'destaques'" />
        <ConfigManager v-if="activeTab === 'config'" />
        <StockManager v-if="activeTab === 'stock'" />
        <SaboresManager v-if="activeTab === 'sabores'" />

        <!-- Mensagem de Acesso Negado (Fallback) -->
        <div v-if="!authStore.isAdmin" class="access-denied">
          <p>❌ Você não tem permissão para acessar esta área.</p>
          <button @click="router.push('/')" class="btn btn--primary">Voltar para Home</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';


// Importar componentes de gerenciamento
import ProductsManager from './ProductsManager.vue';
import OrdersManager from './OrdersManager.vue';
import UsersManager from './UsersManager.vue';
import DestaquesManager from './DestaquesManager.vue';
import ConfigManager from './ConfigManager.vue';
import StockManager from './StockManager.vue';
import SaboresManager from './SaboresManager.vue';

const authStore = useAuthStore();
const router = useRouter();

// Estado da aba ativa
const activeTab = ref('products');

// Função de logout
const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

// Verificação de acesso ao carregar o componente
onMounted(async () => {
  // Garante que o estado de autenticação está atualizado
  if (!authStore.user) {
    await authStore.checkAuth();
  }

  // Redireciona se o usuário não for admin
  if (!authStore.isAdmin) {
    router.push('/');
  }
});

// Observar mudanças no status de admin
watch(() => authStore.isAdmin, (newVal) => {
  if (!newVal) {
    router.push('/');
  }
});
</script>

<style scoped>
/* ===== LAYOUT PRINCIPAL ===== */
.admin-dashboard {
  min-height: 100vh;
  background-color: #F8F6F3;
  display: flex;
  flex-direction: column;
}

/* ===== CABEÇALHO DO PAINEL ===== */
.admin-header {
  background-color: #2C2C2C;
  color: #FFFFFF;
  padding: 20px 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.admin-header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-title {
  font-size: 28px;
  margin: 0;
  color: #FFD700;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-name {
  font-size: 16px;
  color: #E0E0E0;
}

.user-name strong {
  color: #FFFFFF;
}

.btn--logout {
  background-color: #C84C3D;
  color: #FFFFFF;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn--logout:hover {
  background-color: #A63830;
}

.btn--logout .icon {
  font-size: 18px;
}

/* ===== CONTEÚDO PRINCIPAL ===== */
.admin-main-content {
  flex-grow: 1;
  display: flex;
  max-width: 1400px;
  margin: 20px auto;
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* ===== NAVEGAÇÃO POR ABAS (SIDEBAR) ===== */
.admin-tabs {
  width: 250px;
  background-color: #333333;
  padding: 30px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-right: 1px solid #444444;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 25px;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: #E0E0E0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn .icon {
  font-size: 20px;
  color: #FFD700;
}

.tab-btn:hover {
  background-color: #444444;
  color: #FFFFFF;
}

.tab-btn.active {
  background-color: #D4511A;
  color: #FFFFFF;
  border-left: 5px solid #FFD700;
  padding-left: 20px;
}

.tab-btn.active .icon {
  color: #FFFFFF;
}

/* ===== ÁREA DE CONTEÚDO DINÂMICO ===== */
.admin-content-area {
  flex-grow: 1;
  padding: 30px;
  overflow-y: auto;
}

/* ===== MENSAGEM DE ACESSO NEGADO ===== */
.access-denied {
  text-align: center;
  padding: 50px;
  color: #C84C3D;
  font-size: 18px;
  background-color: #FFEBEE;
  border-radius: 8px;
  margin-top: 50px;
}

.access-denied .btn--primary {
  margin-top: 20px;
  background: linear-gradient(135deg, #FFD700 0%, #E6C200 100%);
  color: #1A1A1A;
  box-shadow: 0 4px 12px rgba(212, 81, 26, 0.3);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  display: inline-block;
  text-decoration: none;
  border: none;
}

.access-denied .btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 81, 26, 0.4);
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1024px) {
  .admin-header {
    padding: 15px 20px;
  }

  .admin-title {
    font-size: 24px;
  }

  .admin-main-content {
    flex-direction: column;
    margin: 10px auto;
    border-radius: 8px;
  }

  .admin-tabs {
    width: 100%;
    flex-direction: row;
    justify-content: space-around;
    padding: 15px 0;
    border-right: none;
    border-bottom: 1px solid #444444;
  }

  .tab-btn {
    padding: 10px 15px;
    text-align: center;
    justify-content: center;
    font-size: 14px;
  }

  .tab-btn.active {
    border-left: none;
    border-bottom: 3px solid #FFD700;
    padding-left: 15px;
  }

  .admin-content-area {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .admin-header-content {
    flex-direction: column;
    gap: 15px;
  }

  .admin-title {
    font-size: 22px;
  }

  .user-info {
    flex-direction: column;
    gap: 10px;
  }

  .admin-tabs {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex-grow: 1;
    font-size: 13px;
    padding: 8px 10px;
  }

  .tab-btn .icon {
    font-size: 16px;
  }
}
</style>