<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Meu Perfil</h1>
        <p v-if="authStore.userProfile">Bem-vindo, {{ authStore.userProfile.name }}!</p>
        <p v-else>Carregando...</p>
      </div>

      <!-- Tabs -->
      <div class="dashboard-tabs">
        <button @click="activeTab = 'profile'" :class="['tab-btn', { active: activeTab === 'profile' }]">
          👤 Meu Perfil
        </button>
        <button @click="activeTab = 'orders'" :class="['tab-btn', { active: activeTab === 'orders' }]">
          📋 Meus Pedidos
        </button>
        <button @click="activeTab = 'settings'" :class="['tab-btn', { active: activeTab === 'settings' }]">
          ⚙️ Configurações
        </button>
      </div>

      <!-- TAB: Perfil -->
      <div v-if="activeTab === 'profile'" class="tab-content">
        <div class="profile-card">
          <h2>Informações Pessoais</h2>

          <div class="info-grid">
            <div class="info-item">
              <label>Nome</label>
              <p>{{ authStore.userProfile?.name }}</p>
            </div>
            <div class="info-item">
              <label>Email</label>
              <p>{{ authStore.userProfile?.email }}</p>
            </div>
            <div class="info-item">
              <label>Telefone</label>
              <p>{{ authStore.userProfile?.phone }}</p>
            </div>
            <div class="info-item">
              <label>Endereço</label>
              <p>{{ authStore.userProfile?.address }}</p>
            </div>
            <div class="info-item">
              <label>Referência</label>
              <p>{{ authStore.userProfile?.reference || 'Não informado' }}</p>
            </div>
            <div class="info-item">
              <label>Cadastro</label>
              <p>{{ authStore.userProfile?.created_at ? formatDate(authStore.userProfile.created_at) : 'N/A' }}</p>
            </div>
          </div>

          <button @click="openEditModal" class="btn btn--primary">
            ✏️ Editar Perfil
          </button>
        </div>

        <!-- Estatísticas -->
        <div class="stats-section">
          <h2>Suas Estatísticas</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total de Pedidos</h3>
              <p class="stat-number">{{ userOrders.length }}</p>
            </div>
            <div class="stat-card">
              <h3>Gasto Total</h3>
              <p class="stat-number"> {{ formatPrice(totalSpent) }}</p>
            </div>
            <div class="stat-card">
              <h3>Ticket Médio</h3>
              <p class="stat-number"> {{ formatPrice(averageTicket) }}</p>
            </div>
            <div class="stat-card">
              <h3>Pedidos Completados</h3>
              <p class="stat-number">{{ completedOrders }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: Pedidos -->
      <div v-if="activeTab === 'orders'" class="tab-content">
        <h2>Meus Pedidos</h2>

        <div v-if="userOrders.length === 0" class="empty-state">
          <p>Você ainda não fez nenhum pedido</p>
          <router-link to="/" class="btn btn--primary">
            🍔 Fazer Primeiro Pedido
          </router-link>
        </div>

        <div v-else class="orders-list">
          <div v-for="order in userOrders" :key="order.id" class="order-card">
            <div class="order-header">
              <div>
                <h3>{{ order.order_number }}</h3>
                <p class="order-date">{{ formatDateTime(order.created_at) }}</p>
              </div>
              <span :class="['status-badge', order.status]">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>

            <div class="order-items">
              <p v-for="item in getOrderItems(order.id)" :key="item.id" class="item">
                {{ item.quantity }}x {{ item.product_name }}
                <span class="item-price"> {{ formatPrice(item.subtotal) }}</span>
              </p>
            </div>

            <div class="order-footer">
              <div class="order-total">
                <strong>Total:</strong>
                <strong> {{ formatPrice(order.total) }}</strong>
              </div>
              <button @click="viewOrderDetails(order)" class="btn btn--secondary">
                Ver Detalhes
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: Configurações -->
      <div v-if="activeTab === 'settings'" class="tab-content">
        <div class="settings-card">
          <h2>Configurações da Conta</h2>

          <div class="setting-item">
            <h3>Alterar Senha</h3>
            <p>Atualize sua senha para manter sua conta segura</p>
            <button @click="openPasswordModal" class="btn btn--secondary">
              🔐 Alterar Senha
            </button>
          </div>

          <div class="setting-item danger">
            <h3>Deletar Conta</h3>
            <p>Esta ação é irreversível. Todos os seus dados serão deletados.</p>
            <button @click="confirmDeleteAccount" class="btn btn--danger">
              🗑️ Deletar Minha Conta
            </button>
          </div>

          <div class="setting-item">
            <h3>Sair da Conta</h3>
            <p>Faça logout de sua conta</p>
            <button @click="handleLogout" class="btn btn--secondary">
              🚪 Sair
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Edição de Perfil -->
      <div v-if="isEditModalOpen" class="modal" @click.self="closeEditModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Editar Perfil</h2>
            <button @click="closeEditModal" class="modal-close">✕</button>
          </div>

          <form @submit.prevent="saveProfile">
            <div class="modal-body">
              <div class="form-group">
                <label for="editName">Nome *</label>
                <input id="editName" v-model="editForm.name" type="text" required />
              </div>

              <div class="form-group">
                <label for="editPhone">Telefone *</label>
                <input id="editPhone" v-model="editForm.phone" type="tel" required />
              </div>

              <div class="form-row">
                <div class="form-group form-group-street">
                  <label for="editStreet">Rua *</label>
                  <input id="editStreet" v-model="editForm.street" type="text" placeholder="Nome da rua" required />
                </div>
                <div class="form-group form-group-number">
                  <label for="editNumber">Nº *</label>
                  <input id="editNumber" v-model="editForm.number" type="text" placeholder="Número" required />
                </div>
              </div>

              <div class="form-group">
                <label for="editNeighborhood">Bairro *</label>
                <input id="editNeighborhood" v-model="editForm.neighborhood" type="text" placeholder="Bairro" required />
              </div>

              <div class="form-group">
                <label for="editReference">Referência</label>
                <input id="editReference" v-model="editForm.reference" type="text" placeholder="Próximo a..." />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeEditModal" class="btn btn--secondary">
                Cancelar
              </button>
              <button type="submit" class="btn btn--primary" :disabled="authStore.isLoading">
                {{ authStore.isLoading ? 'Salvando...' : 'Salvar Alterações' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Alterar Senha -->
      <div v-if="isPasswordModalOpen" class="modal" @click.self="closePasswordModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>🔐 Alterar Senha</h2>
            <button @click="closePasswordModal" class="modal-close">✕</button>
          </div>

          <form @submit.prevent="savePassword">
            <div class="modal-body">
              <div class="form-group">
                <label for="newPassword">Nova Senha *</label>
                <input id="newPassword" v-model="passwordForm.newPassword" type="password" placeholder="Mínimo 6 caracteres" required />
              </div>
              <div class="form-group">
                <label for="confirmPassword">Confirmar Senha *</label>
                <input id="confirmPassword" v-model="passwordForm.confirm" type="password" placeholder="Repita a nova senha" required />
              </div>
              <div v-if="passwordForm.error" class="error-msg">
                ⚠️ {{ passwordForm.error }}
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closePasswordModal" class="btn btn--secondary">Cancelar</button>
              <button type="submit" class="btn btn--primary" :disabled="passwordForm.loading">
                {{ passwordForm.loading ? 'Salvando...' : 'Alterar Senha' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Confirmação de Exclusão -->
      <div v-if="isDeleteModalOpen" class="modal" @click.self="closeDeleteModal">
        <div class="modal-content modal-content--narrow">
          <div class="modal-header modal-header--danger">
            <h2>⚠️ Deletar Conta</h2>
            <button @click="closeDeleteModal" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <p>Tem certeza que deseja deletar sua conta? <strong>Esta ação é irreversível</strong> e todos os seus dados serão removidos permanentemente.</p>
          </div>
          <div class="modal-footer">
            <button @click="closeDeleteModal" class="btn btn--secondary">Cancelar</button>
            <button @click="deleteAccount" class="btn btn--danger">Sim, Deletar Conta</button>
          </div>
        </div>
      </div>

      <!-- Modal de Detalhes do Pedido -->
      <div v-if="isDetailsModalOpen" class="modal" @click.self="closeDetailsModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Detalhes do Pedido #{{ selectedOrder?.order_number }}</h2>
            <button @click="closeDetailsModal" class="modal-close">✕</button>
          </div>

          <div v-if="selectedOrder" class="order-details">
            <div class="details-section">
              <h3>Itens do Pedido</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Preço</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in getOrderItems(selectedOrder.id)" :key="item.id">
                    <td>{{ item.product_name }}</td>
                    <td>{{ item.quantity }}</td>
                    <td> {{ formatPrice(item.unit_price) }}</td>
                    <td> {{ formatPrice(item.subtotal) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="details-section">
              <h3>Resumo</h3>
              <p><strong>Subtotal:</strong>  {{ formatPrice(selectedOrder.subtotal) }}</p>
              <p><strong>Taxa de Entrega:</strong>  {{ formatPrice(selectedOrder.delivery_fee) }}</p>
              <p class="total"><strong>Total:</strong>  {{ formatPrice(selectedOrder.total) }}</p>
            </div>

            <div class="details-section">
              <h3>Endereço de Entrega</h3>
              <p>{{ selectedOrder.delivery_address }}</p>
              <p v-if="selectedOrder.delivery_reference" class="reference">
                Referência: {{ selectedOrder.delivery_reference }}
              </p>
            </div>

            <div class="details-section">
              <h3>Status</h3>
              <span :class="['status-badge', selectedOrder.status]">
                {{ getStatusLabel(selectedOrder.status) }}
              </span>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="printOrder" class="btn btn--print">
              🖨️ Imprimir Recibo
            </button>
            <button @click="closeDetailsModal" class="btn btn--secondary">
              Fechar
            </button>
          </div>

          <!-- SEÇÃO DE IMPRESSÃO (Teleportada para o body para evitar problemas de layout) -->
          <Teleport to="body">
            <div id="printable-receipt" class="customer-receipt">
              <div class="receipt-header">
                <h1 class="shop-name">PARIÓ LANCHES GOURMET</h1>
                <p>DEMONSTRATIVO DE PEDIDO #{{ selectedOrder.order_number }}</p>
                <p>{{ formatDateTime(selectedOrder.created_at) }}</p>
              </div>
              
              <div class="receipt-section">
                <p class="section-title">DADOS DO CLIENTE</p>
                <p>===============================</p>
                <p><strong>NOME:</strong> {{ authStore.userProfile?.name }}</p>
                <p><strong>ENDEREÇO:</strong> {{ selectedOrder.delivery_address }}</p>
              </div>

              <div class="receipt-section">
                <p class="section-title">DADOS DO PEDIDO</p>
                <p>===============================</p>
                <div class="receipt-items">
                  <div v-for="item in getOrderItems(selectedOrder.id)" :key="'print-' + item.id" class="receipt-item">
                    <div class="item-main">
                      <span>{{ item.quantity }}x {{ item.product_name }}</span>
                      <span>{{ formatPrice(item.subtotal) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="receipt-summary">
                  <p>Subtotal: {{ formatPrice(selectedOrder.subtotal) }}</p>
                  <p>Taxa de Entrega: {{ formatPrice(selectedOrder.delivery_fee) }}</p>
                  <p class="receipt-total">TOTAL: {{ formatPrice(selectedOrder.total) }}</p>
                </div>
              </div>

              <div class="receipt-section">
                <p>===============================</p>
                <p class="section-title">FORMA DE PAGAMENTO</p>
                <p class="payment-label">{{ getPaymentLabel(selectedOrder.payment_method) }}</p>
              </div>

              <div v-if="selectedOrder.notes" class="receipt-section">
                <p>===============================</p>
                <p><strong>OBSERVAÇÕES:</strong></p>
                <p>{{ selectedOrder.notes }}</p>
              </div>

              <div class="receipt-footer">
                <p>===============================</p>
                <p>{{ customMessage || 'Pedido realizado via Parió App' }}</p>
                <p class="thanks">Agradecemos a preferência!</p>
              </div>
            </div>
          </Teleport>
        </div>
      </div>
    </div>


    <!-- Toast de notificação -->
    <div v-if="toast.show" :class="['dashboard-toast', `dashboard-toast--${toast.type}`]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabaseClient';
import { formatPrice } from '../utils/priceUtils';
import { configService } from '../services/configService';

const authStore = useAuthStore();
const router = useRouter();

const activeTab = ref('profile');
const userOrders = ref([]);
const orderItems = ref([]);
const isEditModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isPasswordModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedOrder = ref(null);
const customMessage = ref('');

// Toast local
const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3500);
};

const editForm = ref({
  name: '',
  phone: '',
  street: '',
  number: '',
  neighborhood: '',
  reference: '',
});

const passwordForm = ref({
  newPassword: '',
  confirm: '',
  loading: false,
  error: '',
});

// ===== COMPUTED =====
const totalSpent = computed(() =>
  userOrders.value.reduce((sum, order) => sum + (order.total || 0), 0)
);

const averageTicket = computed(() =>
  userOrders.value.length === 0 ? 0 : totalSpent.value / userOrders.value.length
);

const completedOrders = computed(() =>
  userOrders.value.filter(o => o.status === 'completed').length
);

// ===== FORMATAÇÃO =====
const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR');
const formatDateTime = (date) => new Date(date).toLocaleString('pt-BR');

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Pronto',
    completed: 'Concluído',
    cancelled: 'Cancelado',
  };
  return labels[status] || status;
};

const getOrderItems = (orderId) =>
  orderItems.value.filter(item => item.order_id === orderId);

const getPaymentLabel = (method) => {
  const map = {
    cartao: '💳 Cartão (Débito/Crédito)',
    pix: '📱 Pix',
    dinheiro: '💵 Dinheiro'
  };
  return map[method] || method || 'Não informado';
};

// ===== FETCH =====
const fetchUserOrders = async () => {
  if (!authStore.user?.id) return;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    userOrders.value = data || [];
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
  }
};

const fetchOrderItems = async () => {
  if (!authStore.user?.id || userOrders.value.length === 0) return;
  try {
    const orderIds = userOrders.value.map(o => o.id);
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);
    if (error) throw error;
    orderItems.value = data || [];
  } catch (err) {
    console.error('Erro ao buscar itens dos pedidos:', err);
  }
};

// ===== CONFIG =====
const loadConfig = async () => {
  try {
    const config = await configService.getDeliveryFee();
    customMessage.value = config.customMessage;
  } catch (err) {
    console.error('Erro ao carregar mensagem personalizada:', err);
  }
};

// ===== PERFIL =====
const openEditModal = () => {
  const profile = authStore.userProfile;
  const fullAddress = profile?.address || '';
  const addressParts = fullAddress.split(',');

  editForm.value = {
    name: profile?.name || '',
    phone: profile?.phone || '',
    street: profile?.street || addressParts[0]?.trim() || '',
    number: profile?.number || (addressParts[1] ? addressParts[1].trim() : ''),
    neighborhood: profile?.neighborhood || '',
    reference: profile?.reference || '',
  };
  isEditModalOpen.value = true;
};

const closeEditModal = () => { isEditModalOpen.value = false; };

const saveProfile = async () => {
  const fullAddress = `${editForm.value.street}, ${editForm.value.number} - ${editForm.value.neighborhood}`;

  const result = await authStore.updateProfile({
    name: editForm.value.name,
    phone: editForm.value.phone,
    address: fullAddress,
    street: editForm.value.street,
    number: editForm.value.number,
    neighborhood: editForm.value.neighborhood,
    reference: editForm.value.reference,
  });

  if (result.success) {
    closeEditModal();
    showToast('Perfil atualizado com sucesso! ✅');
  } else {
    showToast(`Erro ao atualizar perfil: ${result.error}`, 'error');
  }
};

// ===== PEDIDOS =====
const viewOrderDetails = (order) => {
  selectedOrder.value = order;
  isDetailsModalOpen.value = true;
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedOrder.value = null;
};

const printOrder = () => {
  window.print();
};

// ===== ALTERAR SENHA =====
const openPasswordModal = () => {
  passwordForm.value = { newPassword: '', confirm: '', loading: false, error: '' };
  isPasswordModalOpen.value = true;
};

const closePasswordModal = () => { isPasswordModalOpen.value = false; };

const savePassword = async () => {
  passwordForm.value.error = '';

  if (!passwordForm.value.newPassword || !passwordForm.value.confirm) {
    passwordForm.value.error = 'Preencha todos os campos';
    return;
  }
  if (passwordForm.value.newPassword.length < 6) {
    passwordForm.value.error = 'A senha deve ter no mínimo 6 caracteres';
    return;
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirm) {
    passwordForm.value.error = 'As senhas não correspondem';
    return;
  }

  passwordForm.value.loading = true;
  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.value.newPassword,
    });
    if (error) throw error;
    closePasswordModal();
    showToast('Senha alterada com sucesso! 🔐');
  } catch (err) {
    passwordForm.value.error = err.message || 'Erro ao alterar senha';
  } finally {
    passwordForm.value.loading = false;
  }
};

// ===== DELETAR CONTA =====
const confirmDeleteAccount = () => {
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => { isDeleteModalOpen.value = false; };

const deleteAccount = async () => {
  isDeleteModalOpen.value = false;
  try {
    const userId = authStore.user?.id;
    if (!userId) return;

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) throw deleteError;

    await authStore.logout();
    router.push('/');
  } catch (err) {
    showToast(`Erro ao deletar conta: ${err.message}`, 'error');
  }
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};

onMounted(async () => {
  await fetchUserOrders();
  await fetchOrderItems();
  await loadConfig();
});
</script>

<style scoped>
.dashboard {
  background-color: #F8F6F3;
  min-height: 100vh;
  padding: 40px 20px;
}

.dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 40px;
}

.dashboard-header h1 {
  font-size: 32px;
  color: #D4511A;
  margin-bottom: 8px;
}

.dashboard-header p {
  color: #666;
  font-size: 16px;
}

.dashboard-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
  border-bottom: 2px solid #E0E0E0;
  padding-bottom: 16px;
}

.tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  color: #666;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
  margin-bottom: -19px;
}

.tab-btn:hover {
  color: #D4511A;
}

.tab-btn.active {
  color: #D4511A;
  border-bottom-color: #D4511A;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.form-group-street {
  flex: 3;
  margin-bottom: 0;
}

.form-group-number {
  flex: 1;
  margin-bottom: 0;
}

.modal-body {
  padding: 20px 24px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.profile-card {
  background: #FFFFFF;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  margin-bottom: 30px;
}

.profile-card h2 {
  color: #D4511A;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.info-item {
  padding: 16px;
  background-color: #F8F6F3;
  border-radius: 8px;
}

.info-item label {
  display: block;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.info-item p {
  margin: 0;
  font-size: 16px;
  color: #2C2C2C;
  font-weight: 600;
}

.stats-section {
  margin-top: 40px;
}

.stats-section h2 {
  color: #D4511A;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #FFFFFF;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  text-align: center;
}

.stat-card h3 {
  color: #2C2C2C;
  font-size: 14px;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #D4511A;
  margin: 0;
}

.empty-state {
  background: #FFFFFF;
  padding: 60px 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.empty-state p {
  color: #666;
  font-size: 16px;
  margin-bottom: 20px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: #FFFFFF;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E0E0E0;
}

.order-header h3 {
  margin: 0;
  color: #D4511A;
}

.order-date {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #666;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.pending { background-color: #FFF3CD; color: #856404; }
.status-badge.confirmed { background-color: #D1ECF1; color: #0C5460; }
.status-badge.preparing { background-color: #FFE5CC; color: #664D03; }
.status-badge.ready { background-color: #D4EDDA; color: #155724; }
.status-badge.completed { background-color: #E8F5E9; color: #1B4D3E; }
.status-badge.cancelled { background-color: #FFEBEE; color: #C84C3D; }

.order-items {
  margin-bottom: 16px;
}

.item {
  margin: 8px 0;
  color: #2C2C2C;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-weight: 600;
  color: #D4511A;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #E0E0E0;
}

.order-total {
  display: flex;
  gap: 12px;
  color: #D4511A;
}

.settings-card {
  background: #FFFFFF;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.settings-card h2 {
  color: #D4511A;
  margin-bottom: 30px;
}

.setting-item {
  padding: 24px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  margin-bottom: 16px;
}

.setting-item h3 {
  color: #2C2C2C;
  margin-bottom: 8px;
}

.setting-item p {
  color: #666;
  margin-bottom: 16px;
}

.setting-item.danger {
  border-color: #C84C3D;
  background-color: #FFEBEE;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #FFFFFF;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
}

.modal-content--narrow {
  max-width: 440px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #E0E0E0;
  background-color: #F8F6F3;
}

.modal-header--danger {
  background-color: #FFEBEE;
}

.modal-header h2 {
  margin: 0;
  color: #D4511A;
}

.modal-header--danger h2 {
  color: #C84C3D;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #2C2C2C;
}

.order-details {
  padding: 20px;
}

.details-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #E0E0E0;
}

.details-section:last-child {
  border-bottom: none;
}

.details-section h3 {
  color: #D4511A;
  margin-bottom: 12px;
}

.details-section p {
  margin: 8px 0;
  color: #2C2C2C;
}

.reference {
  font-size: 13px;
  color: #666;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.items-table thead {
  background-color: #F8F6F3;
}

.items-table th,
.items-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #E0E0E0;
}

.items-table th {
  font-weight: 600;
  color: #2C2C2C;
}

.total {
  font-size: 16px;
  color: #D4511A;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2C2C2C;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border: 2px solid #D4511A;
  box-shadow: 0 0 0 3px rgba(212, 81, 26, 0.1);
}

.modal-footer {
  padding: 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #E0E0E0;
  background-color: #F8F6F3;
}

.error-msg {
  background: #FFEBEE;
  color: #C84C3D;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  border-left: 3px solid #C84C3D;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn--primary {
  background: linear-gradient(135deg, #FFD700 0%, #E6C200 100%);
  color: #1A1A1A;
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 81, 26, 0.4);
}

.btn--secondary {
  background: none;
  border: 2px solid #D4511A;
  color: #D4511A;
}

.btn--secondary:hover {
  background-color: #F8F6F3;
}

.btn--danger {
  background: linear-gradient(135deg, #C84C3D 0%, #A83A2F 100%);
  color: #FFFFFF;
}

.btn--danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(200, 76, 61, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Toast */
.dashboard-toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.dashboard-toast--success {
  background: #1B4D3E;
  color: #fff;
}

.dashboard-toast--error {
  background: #C84C3D;
  color: #fff;
}

.btn--print {
  background: #FFD700;
  color: #1A1A1A;
  font-weight: 700;
}

.btn--print:hover {
  background: #E6C200;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(230, 194, 0, 0.4);
}

/* CUSTOMER RECEIPT (Oculto na tela) */
.customer-receipt {
  display: none;
}

@media (max-width: 768px) {
  .dashboard-header h1 { font-size: 24px; }

  .dashboard-tabs { flex-direction: column; }

  .tab-btn {
    margin-bottom: 0;
    border-bottom: none;
    border-left: 3px solid transparent;
    padding-left: 16px;
  }

  .tab-btn.active {
    border-left-color: #D4511A;
    border-bottom-color: transparent;
  }

  .info-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }

  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .order-total { flex-direction: column; }
}
</style>

<!-- ESTILOS GLOBAIS DE IMPRESSÃO -->
<style>
@media print {
  /* Esconder o aplicativo inteiro */
  #app {
    display: none !important;
  }

  /* Mostrar apenas o recibo teletransportado no body */
  .customer-receipt {
    display: block !important;
    visibility: visible !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 80mm !important;
    padding: 2mm !important;
    background: white !important;
    color: black !important;
    font-family: 'Courier New', Courier, monospace !important;
  }

  .receipt-section {
    margin-bottom: 4mm;
  }

  .section-title {
    font-weight: bold;
    font-size: 12pt;
    margin-bottom: 1mm;
    white-space: nowrap;
  }

  .shop-name {
    text-align: center;
    font-size: 15pt;
    font-weight: bold;
    margin-bottom: 1mm;
  }

  .receipt-header {
    text-align: center;
    margin-bottom: 4mm;
  }

  .receipt-header p {
    margin: 1mm 0;
    font-size: 10pt;
  }

  .receipt-items {
    margin: 3mm 0;
  }

  .receipt-item {
    margin-bottom: 2mm;
  }

  .item-main {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    font-size: 11pt;
  }

  .receipt-summary {
    text-align: right;
    margin-top: 3mm;
  }

  .receipt-summary p {
    margin: 1mm 0;
    font-size: 11pt;
  }

  .receipt-total {
    font-size: 13pt;
    font-weight: bold;
    border-top: 1px solid black;
    margin-top: 2mm;
    padding-top: 2mm;
  }

  .payment-label {
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
  }

  .receipt-footer {
    text-align: center;
    margin-top: 8mm;
    font-size: 9pt;
  }

  .thanks {
    font-style: italic;
    margin-top: 2mm !important;
  }
}
</style>