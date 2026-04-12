<template>
  <div class="users-manager">
    <div class="manager-container">
      <h1>Gerenciador de Usuários</h1>

      <!-- Filtros e Busca -->
      <div class="manager-toolbar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nome ou email..."
          class="search-input"
        />

        <div class="filter-group">
          <label for="sortBy">Ordenar por:</label>
          <select id="sortBy" v-model="sortBy">
            <option value="recent">Mais Recentes</option>
            <option value="name">Nome (A-Z)</option>
            <option value="orders">Mais Pedidos</option>
          </select>
        </div>
      </div>

      <!-- Tabela de Usuários -->
      <div class="users-table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Pedidos</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone }}</td>
              <td class="orders-count">{{ getUserOrderCount(user.id) }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <button @click="viewUserDetails(user)" class="action-btn view">👁️</button>
                <button @click="editUser(user)" class="action-btn edit">✏️</button>
                <button @click="deleteUser(user.id)" class="action-btn delete">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de Detalhes do Usuário -->
      <div v-if="isDetailsModalOpen" class="modal" @click.self="closeDetailsModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Detalhes do Usuário</h2>
            <button @click="closeDetailsModal" class="modal-close">✕</button>
          </div>

          <div v-if="selectedUser" class="user-details">
            <!-- Informações Pessoais -->
            <div class="details-section">
              <h3>Informações Pessoais</h3>
              <p><strong>Nome:</strong> {{ selectedUser.name }}</p>
              <p><strong>Email:</strong> {{ selectedUser.email }}</p>
              <p><strong>Telefone:</strong> {{ selectedUser.phone }}</p>
              <p><strong>Endereço:</strong> {{ selectedUser.address }}</p>
              <p v-if="selectedUser.reference">
                <strong>Referência:</strong> {{ selectedUser.reference }}
              </p>
            </div>

            <!-- Histórico de Pedidos -->
            <div class="details-section">
              <h3>Histórico de Pedidos</h3>
              <div v-if="userOrders.length === 0" class="no-orders">
                <p>Nenhum pedido realizado</p>
              </div>
              <div v-else class="orders-list">
                <div v-for="order in userOrders" :key="order.id" class="order-item">
                  <div class="order-info">
                    <p><strong>{{ order.order_number }}</strong></p>
                    <p> {{ formatPrice(order.total) }}</p>
                  </div>
                  <div class="order-status">
                    <span :class="['status-badge', order.status]">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </div>
                  <div class="order-date">
                    <p>{{ formatDate(order.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Estatísticas -->
            <div class="details-section">
              <h3>Estatísticas</h3>
              <div class="stats-grid">
                <div class="stat">
                  <p class="stat-label">Total de Pedidos</p>
                  <p class="stat-value">{{ userOrders.length }}</p>
                </div>
                <div class="stat">
                  <p class="stat-label">Gasto Total</p>
                  <p class="stat-value"> {{ formatPrice(getTotalSpent(userOrders)) }}</p>
                </div>
                <div class="stat">
                  <p class="stat-label">Ticket Médio</p>
                  <p class="stat-value"> {{ formatPrice(getAverageTicket(userOrders)) }}</p>
                </div>
                <div class="stat">
                  <p class="stat-label">Cadastrado em</p>
                  <p class="stat-value">{{ formatDate(selectedUser.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeDetailsModal" class="btn btn--secondary">
              Fechar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Edição -->
      <div v-if="isEditModalOpen" class="modal" @click.self="closeEditModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Editar Usuário</h2>
            <button @click="closeEditModal" class="modal-close">✕</button>
          </div>

          <form @submit.prevent="saveUser">
            <div class="form-group">
              <label for="editName">Nome *</label>
              <input id="editName" v-model="editForm.name" type="text" required />
            </div>

            <div class="form-group">
              <label for="editEmail">Email *</label>
              <input id="editEmail" v-model="editForm.email" type="email" required />
            </div>

            <div class="form-group">
              <label for="editPhone">Telefone *</label>
              <input id="editPhone" v-model="editForm.phone" type="tel" required />
            </div>

            <div class="form-group">
              <label for="editAddress">Endereço *</label>
              <input id="editAddress" v-model="editForm.address" type="text" required />
            </div>

            <div class="form-group">
              <label for="editReference">Referência</label>
              <input id="editReference" v-model="editForm.reference" type="text" />
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeEditModal" class="btn btn--secondary">
                Cancelar
              </button>
              <button type="submit" class="btn btn--primary" :disabled="isLoading">
                {{ isLoading ? 'Salvando...' : 'Salvar Usuário' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabaseClient';
import { formatPrice } from '../../utils/priceUtils';

const users = ref([]);
const orders = ref([]);
const searchQuery = ref('');
const sortBy = ref('recent');
const isDetailsModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedUser = ref(null);
const isLoading = ref(false);

const editForm = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  reference: '',
});

const filteredUsers = computed(() => {
  let filtered = users.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  }

  // Ordenação
  if (sortBy.value === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === 'orders') {
    filtered.sort((a, b) => getUserOrderCount(b.id) - getUserOrderCount(a.id));
  } else {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return filtered;
});

const userOrders = computed(() => {
  if (!selectedUser.value) return [];
  return orders.value.filter(o => o.user_id === selectedUser.value.id);
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

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

const getUserOrderCount = (userId) => {
  return orders.value.filter(o => o.user_id === userId).length;
};

const getTotalSpent = (userOrders) => {
  return userOrders.reduce((sum, order) => sum + order.total, 0);
};

const getAverageTicket = (userOrders) => {
  if (userOrders.length === 0) return 0;
  return getTotalSpent(userOrders) / userOrders.length;
};

const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    users.value = data || [];
  } catch (err) {
    alert(`Erro ao buscar usuários: ${err.message}`);
  }
};

const fetchOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    orders.value = data || [];
  } catch (err) {
    alert(`Erro ao buscar pedidos: ${err.message}`);
  }
};

const viewUserDetails = (user) => {
  selectedUser.value = user;
  isDetailsModalOpen.value = true;
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedUser.value = null;
};

const editUser = (user) => {
  selectedUser.value = user;
  editForm.value = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    reference: user.reference,
  };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const saveUser = async () => {
  isLoading.value = true;

  try {
    const { error } = await supabase
      .from('users')
      .update({
        name: editForm.value.name,
        email: editForm.value.email,
        phone: editForm.value.phone,
        address: editForm.value.address,
        reference: editForm.value.reference,
      })
      .eq('id', selectedUser.value.id);

    if (error) throw error;

    await fetchUsers();
    closeEditModal();
    alert('Usuário atualizado com sucesso!');
  } catch (err) {
    alert(`Erro ao atualizar usuário: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
};

const deleteUser = async (userId) => {
  if (!confirm('Tem certeza que deseja deletar este usuário? Todos os seus pedidos também serão deletados.')) {
    return;
  }

  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    await fetchUsers();
    await fetchOrders();
    alert('Usuário deletado com sucesso!');
  } catch (err) {
    alert(`Erro ao deletar usuário: ${err.message}`);
  }
};

onMounted(() => {
  fetchUsers();
  fetchOrders();
});
</script>

<style scoped>
.users-manager {
  background-color: #F8F6F3;
  min-height: 100vh;
  padding: 40px 20px;
}

.manager-container {
  max-width: 1200px;
  margin: 0 auto;
}

.manager-container h1 {
  color: #D4511A;
  margin-bottom: 30px;
}

.manager-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
  flex-wrap: wrap;
}

.search-input {
  padding: 10px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 14px;
  flex: 1;
  min-width: 200px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 600;
  color: #2C2C2C;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 14px;
}

.users-table {
  background: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #F8F6F3;
  border-bottom: 2px solid #E0E0E0;
}

th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #2C2C2C;
}

td {
  padding: 16px;
  border-bottom: 1px solid #E0E0E0;
}

tbody tr:hover {
  background-color: #F8F6F3;
}

.orders-count {
  font-weight: 600;
  color: #D4511A;
}

.action-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin-right: 8px;
  transition: transform 0.2s;
}

.action-btn:hover {
  transform: scale(1.2);
}

.action-btn.delete:hover {
  color: #C84C3D;
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
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #E0E0E0;
  background-color: #F8F6F3;
}

.modal-header h2 {
  margin: 0;
  color: #D4511A;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #2C2C2C;
}

.user-details {
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

.no-orders {
  padding: 20px;
  text-align: center;
  color: #999;
  background-color: #F8F6F3;
  border-radius: 6px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  background-color: #F8F6F3;
}

.order-info p {
  margin: 4px 0;
  font-size: 13px;
}

.order-info p:first-child {
  font-weight: 600;
  color: #D4511A;
}

.order-status {
  flex: 1;
  text-align: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  display: inline-block;
}

.status-badge.pending {
  background-color: #FFF3CD;
  color: #856404;
}

.status-badge.confirmed {
  background-color: #D1ECF1;
  color: #0C5460;
}

.status-badge.preparing {
  background-color: #FFE5CC;
  color: #664D03;
}

.status-badge.ready {
  background-color: #D4EDDA;
  color: #155724;
}

.status-badge.completed {
  background-color: #E8F5E9;
  color: #1B4D3E;
}

.status-badge.cancelled {
  background-color: #FFEBEE;
  color: #C84C3D;
}

.order-date {
  text-align: right;
  font-size: 12px;
  color: #666;
}

.order-date p {
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.stat {
  background-color: #F8F6F3;
  padding: 16px;
  border-radius: 6px;
  text-align: center;
}

.stat-label {
  margin: 0;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
}

.stat-value {
  margin: 8px 0 0 0;
  font-size: 18px;
  font-weight: 700;
  color: #D4511A;
}

.form-group {
  padding: 20px;
  border-bottom: 1px solid #E0E0E0;
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
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .manager-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    min-width: auto;
  }

  table {
    font-size: 12px;
  }

  th, td {
    padding: 12px 8px;
  }

  .action-btn {
    margin-right: 4px;
  }

  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .order-status,
  .order-date {
    width: 100%;
    text-align: left;
  }
}
</style>