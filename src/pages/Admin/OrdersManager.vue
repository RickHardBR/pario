<template>
  <div class="orders-manager">
    <h1>Gerenciar Pedidos</h1>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Carregando pedidos...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchOrders" class="btn btn--secondary">Tentar Novamente</button>
    </div>

    <div v-else>
      <!-- Busca e Filtros -->
      <div class="orders-filters">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar por número do pedido..." 
            class="search-input"
          />
        </div>
        <div class="orders-count">
          Exibindo {{ filteredOrders.length }} pedidos
        </div>
      </div>
      <div class="table-wrapper">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Nº Pedido</th>
              <th>Cliente</th>
              <th>Telefone</th>
              <th>Endereço</th>
              <th>Subtotal</th>
              <th>Taxa</th>
              <th>Total</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td>{{ order.order_number }}</td>
              <td>{{ order.user?.name || order.user?.email || 'N/A' }}</td>
              <td>{{ order.user?.phone || 'N/A' }}</td>
              <td class="address-cell">{{ order.delivery_address || 'N/A' }}</td>
              <td>{{ formatPrice(order.subtotal) }}</td>
              <td>{{ formatPrice(order.delivery_fee) }}</td>
              <td class="total-cell">{{ formatPrice(order.total) }}</td>
              <td>
                <select 
                  :value="order.status" 
                  @change="updateStatus(order.id, $event.target.value)"
                  class="status-select"
                  :class="getStatusClass(order.status)"
                >
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="preparing">Preparando</option>
                  <option value="delivering">Entregando</option>
                  <option value="delivered">Entregue</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </td>
              <td>{{ formatDate(order.created_at) }}</td>
              <td class="actions-cell">
                <button @click="handleQuickPrint(order)" class="btn btn--small btn--print-row" title="Impressão Rápida">
                  🖨️
                </button>
                <button @click="viewOrderDetails(order)" class="btn btn--small btn--info" title="Ver detalhes">
                  👁️
                </button>
                <button @click="deleteOrder(order.id)" class="btn btn--small btn--danger" title="Deletar">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Detalhes do Pedido -->
    <div v-if="selectedOrder" class="modal" @click.self="closeModal">
      <div class="modal__content">
        <div class="modal__header">
          <h2>Pedido {{ selectedOrder.order_number }}</h2>
          <div class="modal__header-actions">
            <button @click="printOrder" class="btn btn--print" title="Imprimir para Cozinha">
              🖨️ Imprimir Cupom
            </button>
            <button class="modal__close" @click="closeModal">✕</button>
          </div>
        </div>
        
        <div class="modal__body">
          <!-- Conteúdo Visual do Modal (Original) -->
          <div class="order-info">
            <h3>Informações do Cliente</h3>
            <p><strong>Nome:</strong> {{ selectedOrder.user?.name || selectedOrder.user?.email }}</p>
            <p><strong>Telefone:</strong> {{ selectedOrder.user?.phone || 'N/A' }}</p>
            <p><strong>Endereço:</strong> {{ selectedOrder.delivery_address || 'N/A' }}</p>
            <p v-if="selectedOrder.delivery_reference"><strong>Referência:</strong> {{ selectedOrder.delivery_reference }}</p>
            <p v-if="selectedOrder.notes"><strong>Observações:</strong> {{ selectedOrder.notes }}</p>
          </div>
          
          <div class="order-items">
            <h3>Itens do Pedido</h3>
            <div class="items-wrapper">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Variação</th>
                    <th>Qtd</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedOrder.order_items" :key="item.id">
                    <td>{{ item.product_name }}</td>
                    <td>{{ item.variation_name || '-' }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatPrice(item.subtotal) }}</td>
                  </tr>
                  <!-- Extras como linhas abaixo dos itens -->
                  <template v-for="item in selectedOrder.order_items" :key="'extra-' + item.id">
                    <tr v-for="extra in item.order_item_extras" :key="extra.id" class="extra-row">
                      <td colspan="2">└─ {{ extra.extra_name }}</td>
                      <td>{{ extra.quantity }}</td>
                      <td>{{ formatPrice(extra.extra_price * extra.quantity) }}</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>

            <div class="order-summary-box">
              <p><strong>Subtotal:</strong> {{ formatPrice(selectedOrder.subtotal) }}</p>
              <p><strong>Taxa Entrega:</strong> {{ formatPrice(selectedOrder.delivery_fee) }}</p>
              <p class="final-total"><strong>TOTAL:</strong> {{ formatPrice(selectedOrder.total) }}</p>
            </div>
          </div>

          <!-- SEÇÃO DE IMPRESSÃO (Teleportada para o body para evitar problemas de layout) -->
          <Teleport to="body">
            <div id="printable-ticket" class="kitchen-ticket">
              <div class="ticket-header">
                <h1 class="shop-name">PARIÓ LANCHES</h1>
                <p class="order-id">PEDIDO #{{ selectedOrder.order_number }}</p>
                <p class="at-time">{{ formatDateWithTime(selectedOrder.created_at) }}</p>
              </div>
              
              <div class="ticket-section">
                <p class="section-title">DADOS DO CLIENTE</p>
                <p>===============================</p>
                <p><strong>NOME:</strong> {{ selectedOrder.user?.name || 'Não informado' }}</p>
                <p><strong>TEL:</strong> {{ selectedOrder.user?.phone || 'N/A' }}</p>
                <p><strong>ENDEREÇO:</strong> {{ selectedOrder.delivery_address }}</p>
                <p v-if="selectedOrder.delivery_reference"><strong>REF:</strong> {{ selectedOrder.delivery_reference }}</p>
              </div>

              <div class="ticket-section">
                <p class="section-title">DADOS DO PEDIDO</p>
                <p>===============================</p>
                <div class="ticket-items">
                  <div v-for="item in selectedOrder.order_items" :key="'print-' + item.id" class="ticket-item">
                    <div class="item-main">
                      <span class="qty">{{ item.quantity }}x</span>
                      <span class="name">{{ item.product_name }}</span>
                      <span class="price">{{ formatPrice(item.subtotal) }}</span>
                    </div>
                    <div v-if="item.variation_name" class="item-var">
                       >> {{ item.variation_name }}
                    </div>
                    <div v-for="extra in item.order_item_extras" :key="'print-extra-'+extra.id" class="item-extra">
                      [+] {{ extra.extra_name }} ({{ extra.quantity }}x) - {{ formatPrice(extra.extra_price * extra.quantity) }}
                    </div>
                  </div>
                </div>
                
                <div class="ticket-values">
                  <p>Subtotal: {{ formatPrice(selectedOrder.subtotal) }}</p>
                  <p>Taxa de Entrega: {{ formatPrice(selectedOrder.delivery_fee) }}</p>
                  <p class="print-total">TOTAL: {{ formatPrice(selectedOrder.total) }}</p>
                </div>
              </div>

              <div class="ticket-section">
                <p>===============================</p>
                <p class="section-title">FORMA DE PAGAMENTO</p>
                <p class="payment-method-text">{{ getPaymentLabel(selectedOrder.payment_method) }}</p>
              </div>

              <div v-if="selectedOrder.notes" class="ticket-section">
                <p>===============================</p>
                <p><strong>OBSERVAÇÕES:</strong></p>
                <p class="obs-text">{{ selectedOrder.notes }}</p>
              </div>

              <div class="ticket-footer">
                <p>===============================</p>
                <p class="thanks">{{ customMessage || 'Obrigado pela preferência!' }}</p>
              </div>
            </div>
          </Teleport>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { supabase } from '../../lib/supabaseClient';
import { formatPrice } from '../../utils/priceUtils';
import ConfirmModal from '../../components/ConfirmModal.vue';
import { configService } from '../../services/configService';

const orders = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedOrder = ref(null);
const confirmModal = ref(null);
const searchQuery = ref('');
const customMessage = ref('');

// Computed para filtrar pedidos
const filteredOrders = computed(() => {
  if (!searchQuery.value) return orders.value;
  
  const query = searchQuery.value.toLowerCase().trim();
  return orders.value.filter(order => 
    order.order_number.toLowerCase().includes(query) ||
    (order.user?.name && order.user.name.toLowerCase().includes(query))
  );
});

const formatDateWithTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('pt-BR');
};

const printOrder = () => {
  window.print();
};

const handleQuickPrint = async (order) => {
  await viewOrderDetails(order);
  setTimeout(() => {
    window.print();
  }, 500);
};

// Buscar configurações da loja
const loadConfig = async () => {
  try {
    const config = await configService.getDeliveryFee();
    customMessage.value = config.customMessage;
  } catch (err) {
    console.error('Erro ao carregar mensagem personalizada:', err);
  }
};

// Buscar pedidos
const fetchOrders = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const { data, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        user:users (
          name,
          email,
          phone
        ),
        order_items (
          id,
          product_name,
          variation_name,
          quantity,
          unit_price,
          subtotal,
          order_item_extras (
            id,
            extra_name,
            extra_price,
            quantity
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    orders.value = data || [];
  } catch (err) {
    error.value = err.message;
    window.toast?.error(`Erro ao carregar pedidos: ${err.message}`, 4000);
  } finally {
    loading.value = false;
  }
};

// Atualizar status do pedido
const updateStatus = async (orderId, newStatus) => {
  try {
    ('Atualizando status:', { orderId, newStatus });
    
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date() })
      .eq('id', orderId);

    if (updateError) {
      console.error('Erro do Supabase:', updateError);
      throw updateError;
    }

    // Atualizar localmente
    const order = orders.value.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      ('Status atualizado localmente:', order.status);
    }
    
    window.toast?.success(`Status do pedido atualizado para ${getStatusText(newStatus)}`, 3000);
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    window.toast?.error(`Erro ao atualizar status: ${err.message}`, 4000);
  }
};

// Deletar pedido com modal de confirmação
const deleteOrder = async (orderId) => {
  const confirmed = await confirmModal.value.open({
    title: 'Deletar Pedido',
    message: 'Tem certeza que deseja deletar este pedido? Esta ação não pode ser desfeita.',
    confirmText: 'Sim, deletar',
    cancelText: 'Cancelar'
  });
  
  if (!confirmed) return;

  try {
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (deleteError) throw deleteError;

    await fetchOrders();
    window.toast?.success('Pedido deletado com sucesso!', 3000);
  } catch (err) {
    window.toast?.error(`Erro ao deletar pedido: ${err.message}`, 4000);
  }
};

// Ver detalhes do pedido
const viewOrderDetails = async (order) => {
  // Adicionar classe no body para prevenir scroll
  document.body.classList.add('modal-open');
  
  const { data, error: fetchError } = await supabase
    .from('orders')
    .select(`
      *,
      user:users (
        name,
        email,
        phone
      ),
      order_items (
        id,
        product_name,
        variation_name,
        quantity,
        unit_price,
        subtotal,
        order_item_extras (
          id,
          extra_name,
          extra_price,
          quantity
        )
      )
    `)
    .eq('id', order.id)
    .single();
  
  if (fetchError) {
    window.toast?.error(`Erro ao carregar detalhes: ${fetchError.message}`, 4000);
    document.body.classList.remove('modal-open');
    return;
  }
  
  selectedOrder.value = data;
};

// Fechar modal
const closeModal = () => {
  selectedOrder.value = null;
  document.body.classList.remove('modal-open');
};

onMounted(() => {
  fetchOrders();
  loadConfig();
});

onUnmounted(() => {
  document.body.classList.remove('modal-open');
});

// Utilitários
const getStatusText = (status) => {
  const statusMap = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    delivering: 'Entregando',
    delivered: 'Entregue',
    cancelled: 'Cancelado'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const classMap = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    preparing: 'status-preparing',
    delivering: 'status-delivering',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled'
  };
  return classMap[status] || '';
};

const getPaymentLabel = (method) => {
  const map = {
    cartao: '💳 Cartão (Débito/Crédito)',
    pix: '📱 Pix',
    dinheiro: '💵 Dinheiro'
  };
  return map[method] || method || 'Não informado';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('pt-BR');
};
</script>

<style scoped>
.orders-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #D4511A;
  box-shadow: 0 0 0 2px rgba(212, 81, 26, 0.1);
}

.orders-count {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.no-results {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  color: #888;
  font-style: italic;
}

.orders-manager {
  padding: 20px;
}

.orders-manager h1 {
  color: #D4511A;
  margin-bottom: 24px;
  font-size: 24px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.error {
  color: #C84C3D;
  background-color: #FFEBEE;
  border-radius: 8px;
}

/* Container da tabela com scroll horizontal apenas */
.orders-table-container {
  overflow-x: auto;
  width: 100%;
}

.table-wrapper {
  min-width: 1000px;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.orders-table th,
.orders-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #E0E0E0;
}

.orders-table th {
  background: #F8F6F3;
  font-weight: 600;
  color: #2C2C2C;
  font-size: 13px;
}

.orders-table td {
  font-size: 13px;
  color: #333;
}

.address-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.total-cell {
  font-weight: 700;
  color: #D4511A;
}

.actions-cell {
  white-space: nowrap;
}

.status-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: white;
}

.status-select.status-pending { background: #FFF3E0; color: #FF9800; }
.status-select.status-confirmed { background: #E3F2FD; color: #2196F3; }
.status-select.status-preparing { background: #E8EAF6; color: #3F51B5; }
.status-select.status-delivering { background: #F3E5F5; color: #9C27B0; }
.status-select.status-delivered { background: #E8F5E9; color: #4CAF50; }
.status-select.status-cancelled { background: #FFEBEE; color: #F44336; }

.btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
}

.btn--small {
  padding: 6px 10px;
  margin: 0 4px;
}

.btn--print-row {
  background: #28a745;
  color: white;
}

.btn--print-row:hover {
  background: #218838;
}

.btn--info {
  background: #2196F3;
  color: white;
}

.btn--info:hover {
  background: #1976D2;
}

.btn--danger:hover {
  background: #D32F2F;
}

.btn--secondary {
  background: #666;
  color: white;
  padding: 8px 16px;
}

.btn--secondary:hover {
  background: #555;
}

/* Modal de Detalhes */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}

.modal__content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #D4511A;
  color: white;
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
}

.modal__header h2 {
  margin: 0;
  font-size: 20px;
}

.modal__close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.8;
}

.modal__close:hover {
  opacity: 1;
}

.modal__body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  max-height: calc(85vh - 70px);
}

/* Scroll personalizado */
.modal__body::-webkit-scrollbar {
  width: 6px;
}

.modal__body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal__body::-webkit-scrollbar-thumb {
  background: #D4511A;
  border-radius: 3px;
}

/* Prevenir scroll no body quando modal está aberto */
:global(body.modal-open) {
  overflow: hidden;
}

.order-info {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E0E0E0;
}

.order-info h3, .order-items h3 {
  color: #D4511A;
  font-size: 16px;
  margin-bottom: 12px;
}

.order-info p {
  margin: 8px 0;
  font-size: 14px;
}

.items-wrapper {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}

.items-table th,
.items-table td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #E0E0E0;
  font-size: 13px;
}

.items-table th {
  background: #F8F6F3;
  font-weight: 600;
}

.btn--print {
  background: #FFD700;
  color: #1A1A1A;
  font-weight: 700;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.btn--print:hover {
  background: #E6C200;
  transform: translateY(-1px);
}

.modal__header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-summary-box {
  margin-top: 20px;
  padding: 16px;
  background: #F8F6F3;
  border-radius: 8px;
  text-align: right;
}

.order-summary-box p {
  margin: 4px 0;
  font-size: 14px;
}

.final-total {
  font-size: 18px;
  color: #D4511A;
  margin-top: 8px !important;
  border-top: 1px solid #ddd;
  padding-top: 8px;
}

/* KITCHEN TICKET (Oculto por padrão na tela) */
.kitchen-ticket {
  display: none;
}

.extra-row {
  background: #F8F6F3;
  font-size: 12px;
  color: #666;
}


@media (max-width: 768px) {
  .orders-table th,
  .orders-table td {
    padding: 8px;
    font-size: 11px;
  }
  
  .address-cell {
    max-width: 120px;
  }
  
  .modal__content {
    max-width: 95%;
    max-height: 90vh;
  }
  
  .modal__body {
    max-height: calc(90vh - 70px);
  }
}
</style>

<!-- ESTILOS GLOBAIS DE IMPRESSÃO -->
<style>
@media print {
  /* Esconder o aplicativo inteiro */
  #app {
    display: none !important;
  }

  /* Mostrar apenas os cupons teletransportados no body */
  .kitchen-ticket, .customer-receipt {
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

  .ticket-section {
    margin-bottom: 4mm;
  }

  .section-title {
    font-weight: bold;
    font-size: 13pt;
    margin-bottom: 1mm;
    white-space: nowrap;
  }

  .shop-name {
    text-align: center;
    font-size: 16pt;
    font-weight: bold;
    margin-bottom: 1mm;
  }

  .order-id {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin: 0;
  }

  .at-time {
    text-align: center;
    font-size: 10pt;
    margin-bottom: 5mm;
  }

  .ticket-item {
    margin-bottom: 3mm;
  }

  .item-main {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    font-size: 12pt;
    width: 100%;
  }

  .item-main .name {
    flex-grow: 1;
    margin: 0 5px;
  }

  .item-var {
    font-size: 11pt;
    margin-left: 5mm;
    font-style: italic;
  }

  .item-extra {
    font-size: 10pt;
    margin-left: 5mm;
  }

  .ticket-values {
    text-align: right;
    margin-top: 3mm;
  }

  .print-total {
    font-size: 14pt;
    font-weight: bold;
    border-top: 1px solid black;
    margin-top: 2mm;
    padding-top: 2mm;
  }

  .payment-method-text {
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
  }

  .obs-text {
    font-size: 11pt;
    font-weight: bold;
    padding: 2mm;
    border: 1px solid black;
  }

  .ticket-footer {
    text-align: center;
    margin-top: 5mm;
  }

  .thanks {
    font-style: italic;
    font-size: 10pt;
  }
}
</style>