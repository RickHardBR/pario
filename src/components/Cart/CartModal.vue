<template>
  <Transition name="cart-fade">
  <div v-if="isOpen" class="cart-modal" @click.self="closeCart">
    <Transition name="cart-slide">
    <div class="cart-modal__content" v-if="isOpen">
      <!-- Header -->
      <div class="cart-modal__header">
        <h2>Seu Carrinho</h2>
        <button class="cart-modal__close" @click="closeCart">✕</button>
      </div>

      <!-- Items -->
      <div class="cart-modal__items">
        <div v-if="cartStore.items.length === 0" class="cart-modal__empty">
          <p>Seu carrinho está vazio</p>
        </div>

        <div v-else>
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <!-- Linha 1: Produto principal + Quantidade + Preço -->
            <div class="cart-item__row">
              <div class="cart-item__info">
                <h4>{{ item.name }}</h4>
                <p v-if="item.variation" class="item-variation">{{ item.variation }}</p>
                <p v-if="item.description" class="item-description">{{ item.description }}</p>
              </div>

              <div class="cart-item__quantity">
                <button @click="decrementQuantity(item.id)">−</button>
                <input v-model.number="item.quantity" type="number" readonly />
                <button @click="incrementQuantity(item.id)">+</button>
              </div>

              <div class="cart-item__price">
                {{ formatPrice(item.price * item.quantity) }}
              </div>

              <button @click="removeItem(item.id)" class="cart-item__remove">🗑️</button>
            </div>

            <!-- Linha 2: Extras -->
            <div v-if="item.extras && item.extras.length > 0" class="cart-item__extras">
              <div v-for="extra in item.extras" :key="extra.id" class="extra-row">
                <div class="extra-info">
                  <span class="extra-icon">+</span>
                  <span class="extra-name">{{ extra.name }}</span>
                </div>
                <div class="extra-quantity">
                  x{{ extra.quantity || item.quantity }}
                </div>
                <div class="extra-price">
                  {{ formatPrice((extra.price || 0) * (extra.quantity || item.quantity)) }}
                </div>
                <button @click="removeExtra(item.id, extra.id)" class="extra-remove">✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div v-if="cartStore.items.length > 0" class="cart-modal__summary">
        <div class="summary-line">
          <span>Subtotal:</span>
          <span>{{ formatPrice(cartStore.subtotal) }}</span>
        </div>

        <!-- Opção de Entrega -->
        <div class="summary-line">
          <label for="deliveryType">Tipo de Entrega:</label>
          <select id="deliveryType" v-model="deliveryType" @change="updateDeliveryType">
            <option value="pickup">📍 Retirada na loja (Grátis)</option>
            <option value="delivery">🚚 Entrega (R$ {{ formatPrice(localDeliveryFee) }})</option>
          </select>
        </div>

        <!-- Mensagem de entrega grátis (apenas se for entrega) -->
        <div v-if="deliveryType === 'delivery' && cartStore.freeDeliveryMessage" class="summary-line free-delivery">
          <span>{{ cartStore.freeDeliveryMessage }}</span>
        </div>

        <div class="summary-line">
          <span>Taxa de Entrega:</span>
          <span>{{ formatPrice(deliveryFeeToShow) }}</span>
        </div>

        <div class="summary-line total">
          <span>Total:</span>
          <span>{{ formatPrice(totalWithDelivery) }}</span>
        </div>
      </div>
      <!-- Customer Info -->
      <div v-if="cartStore.items.length > 0 && authStore.isAuthenticated" class="cart-modal__customer-info">
        <h3>Dados para Entrega</h3>
        <form @submit.prevent="handleSendOrder">
          <div class="form-group">
            <label>Nome: {{ authStore.userProfile.name }}</label>
          </div>

          <div class="form-group">
            <label>Telefone: {{ authStore.userProfile.phone }}</label>
          </div>

          <div class="form-group">
            <label for="address">Endereço *</label>
            <input
              id="address"
              v-model="orderForm.address"
              type="text"
              placeholder="Rua, número"
              required
            />
          </div>

          <div class="form-group">
            <label for="reference">Referência (opcional)</label>
            <input
              id="reference"
              v-model="orderForm.reference"
              type="text"
              placeholder="Próximo a..."
            />
          </div>

          <!-- Forma de Pagamento -->
          <div class="form-group">
            <label for="paymentMethod">Forma de Pagamento *</label>
            <select id="paymentMethod" v-model="paymentMethod" required>
              <option value="">Selecione</option>
              <option value="cartao">💳 Cartão de Crédito/Débito</option>
              <option value="pix">📱 Pix</option>
              <option value="dinheiro">💵 Dinheiro</option>
            </select>
          </div>

          <!-- Troco para Dinheiro -->
          <div v-if="paymentMethod === 'dinheiro'" class="form-group">
            <label for="changeAmount">Troco para quanto?</label>
            <input id="changeAmount" v-model.number="changeAmount" type="number" step="0.01" placeholder="Ex: 100,00" />
            <small>Deixe em branco se não precisar de troco</small>
          </div>

          <div class="form-group">
            <label for="notes">Observações (opcional)</label>
            <textarea
              id="notes"
              v-model="orderForm.notes"
              placeholder="Alguma observação especial?"
              rows="3"
            ></textarea>
          </div>

          <button type="submit" class="btn btn--primary btn--full" :disabled="cartStore.isLoading">
            {{ cartStore.isLoading ? 'Enviando...' : '📱 ENVIAR PEDIDO VIA WHATSAPP' }}
          </button>
        </form>
      </div>

      <!-- Not Authenticated -->
      <div v-else-if="cartStore.items.length > 0" class="cart-modal__auth-required">
        <p>Você precisa estar autenticado para fazer um pedido</p>
        <router-link to="/login" class="btn btn--primary">Fazer Login</router-link>
      </div>
    </div>
    </Transition>
  </div>
  </Transition>
</template>


<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { formatPrice } from '../../utils/priceUtils';
import { configService } from '../../services/configService';

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const paymentMethod = ref('');
const changeAmount = ref(null);

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const orderForm = ref({
  address: '',
  reference: '',
  notes: '',
});

const whatsappNumber = ref('5511999999999');

// ===== ESTADO PARA TIPO DE ENTREGA =====
const deliveryType = ref('delivery'); // 'delivery' ou 'pickup'
const localDeliveryFee = ref(0); // Valor local da taxa

// Carregar número do WhatsApp quando o modal abrir
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    const number = await configService.getWhatsAppNumber();
    whatsappNumber.value = number;
    
    // Carregar a taxa do store
    localDeliveryFee.value = cartStore.deliveryFee;
    deliveryType.value = cartStore.deliveryFee > 0 ? 'delivery' : 'pickup';
    
    // Carregar endereço salvo do perfil
    if (authStore.userProfile) {
      orderForm.value.address = authStore.userProfile.address || '';
      orderForm.value.reference = authStore.userProfile.reference || '';
    }
  }
});

// Computed para mostrar a taxa correta
const deliveryFeeToShow = computed(() => {
  if (deliveryType.value === 'pickup') return 0;
  // Se for entrega e tiver entrega grátis, mostra 0
  if (cartStore.freeDeliveryMin > 0 && cartStore.subtotal >= cartStore.freeDeliveryMin) {
    return 0;
  }
  return localDeliveryFee.value;
});

const totalWithDelivery = computed(() => {
  return cartStore.subtotal + deliveryFeeToShow.value;
});

// Atualizar quando mudar o tipo
const updateDeliveryType = () => {
  // Não faz nada além de atualizar a UI, a taxa é calculada pelo computed
};

const closeCart = () => {
  emit('close');
};

const incrementQuantity = (itemId) => {
  const item = cartStore.items.find(i => i.id === itemId);
  if (item) item.quantity += 1;
};

const decrementQuantity = (itemId) => {
  const item = cartStore.items.find(i => i.id === itemId);
  if (item && item.quantity > 1) item.quantity -= 1;
};

const removeItem = (itemId) => {
  cartStore.removeItem(itemId);
};

const removeExtra = (itemId, extraId) => {
  cartStore.removeExtra(itemId, extraId);
};

const handleSendOrder = async () => {
  // Atualizar endereço de entrega (apenas se for entrega)
  if (deliveryType.value === 'delivery') {
    cartStore.setDeliveryInfo(
      orderForm.value.address || authStore.userProfile.address,
      orderForm.value.reference || authStore.userProfile.reference
    );
    // Usar a taxa local
    cartStore.setDeliveryFee(deliveryFeeToShow.value);
  } else {
    // Para retirada, limpa endereço e taxa zero
    cartStore.setDeliveryInfo('Retirada na loja', '');
    cartStore.setDeliveryFee(0);
  }

  // Salvar os itens do carrinho
  const savedItems = [...cartStore.items];
  const savedSubtotal = cartStore.subtotal;
  const savedDeliveryFee = deliveryType.value === 'pickup' ? 0 : deliveryFeeToShow.value;
  const savedTotal = savedSubtotal + savedDeliveryFee;

  // ABRIR ABA IMEDIATAMENTE (Gesto do Usuário para evitar bloqueio)
  const newTab = window.open('about:blank', '_blank');

  // Criar pedido
  const result = await cartStore.createOrder(orderForm.value.notes, paymentMethod.value);

  if (result.success) {
    const whatsappMessage = generateWhatsAppMessageWithData(
      result.order, 
      savedItems, 
      savedSubtotal, 
      savedDeliveryFee, 
      savedTotal
    );

    let cleanNumber = whatsappNumber.value.replace(/\D/g, '');
    if (!cleanNumber.startsWith('55')) {
      cleanNumber = '55' + cleanNumber;
    }
    
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // ATUALIZAR A ABA JÁ ABERTA
    if (newTab) {
      newTab.location.href = whatsappUrl;
    } else {
      // Fallback
      window.open(whatsappUrl, '_blank');
    }

    closeCart();
  } else {
    // Fechar aba se deu erro
    if (newTab) newTab.close();
    window.toast?.error(`Erro ao criar pedido: ${cartStore.error}`, 4000);
  }
};

// Função para gerar mensagem com os dados salvos
const generateWhatsAppMessageWithData = (order, items, subtotal, deliveryFee, total) => {
  const divider = '==============================';
  let message = `*PARIÓ LANCHES*\n`;
  message += `*PEDIDO #${order.order_number}*\n`;
  message += `${new Date().toLocaleString('pt-BR')}\n\n`;

  message += `*DADOS DO CLIENTE*\n`;
  message += `${divider}\n`;
  message += `*NOME:* ${authStore.userProfile?.name || 'Não informado'}\n`;
  message += `*TEL:* ${authStore.userProfile?.phone || ''}\n`;
  
  if (deliveryType.value === 'pickup') {
    message += `*TIPO:* Retirada na loja\n`;
  } else {
    message += `*ENDEREÇO:* ${order.delivery_address}\n`;
    if (order.delivery_reference) {
      message += `*REF:* ${order.delivery_reference}\n`;
    }
  }
  
  message += `\n*DADOS DO PEDIDO*\n`;
  message += `${divider}\n`;

  items.forEach(item => {
    let displayName = item.name;
    if (item.variation) {
      if (!item.name.toLowerCase().startsWith('pizza')) {
        displayName = `Pizza ${item.name}`;
      }
    }
    
    message += `*${item.quantity}x ${displayName}*`;
    message += ` - *${formatPrice(item.price * item.quantity)}*\n`;
    
    if (item.variation) message += `   >> ${item.variation}\n`;

    if (item.extras && item.extras.length > 0) {
      item.extras.forEach(extra => {
        message += `   [+] ${extra.name} (${extra.quantity || item.quantity}x) - ${formatPrice(extra.price)}\n`;
      });
    }
    message += `\n`;
  });

  message += `${divider}\n`;
  message += `Subtotal: ${formatPrice(subtotal)}\n`;
  message += `Taxa de Entrega: ${formatPrice(deliveryFee)}\n`;
  message += `*TOTAL: ${formatPrice(total)}*\n\n`;

  message += `*FORMA DE PAGAMENTO*\n`;
  message += `${divider}\n`;
  message += `${getPaymentLabel(paymentMethod.value).toUpperCase()}\n\n`;

  if (order.notes) {
    message += `*OBSERVAÇÕES:*\n`;
    message += `\`${order.notes}\`\n\n`;
  }

  message += `${divider}\n`;
  message += `_${cartStore.customMessage}_`;
  
  return message;
};

const getPaymentLabel = (method) => {
  const map = {
    cartao: '💳 Cartão (Débito/Crédito)',
    pix: '📱 Pix',
    dinheiro: '💵 Dinheiro'
  };
  return map[method] || method || 'Não informado';
};
</script>

<style scoped>
.cart-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.cart-modal__content {
  background-color: #FFFFFF;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
}

.cart-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #E0E0E0;
  background-color: #F8F6F3;
  position: sticky;
  top: 0;
  z-index: 10;
}

.cart-modal__header h2 {
  margin: 0;
  color: #D4511A;
}

.cart-modal__close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #2C2C2C;
  transition: color 0.3s;
}

.cart-modal__close:hover {
  color: #D4511A;
}

.cart-modal__items {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.cart-modal__empty {
  text-align: center;
  padding: 40px 20px;
  color: #2C2C2C;
  font-size: 16px;
}

.cart-item {
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: white;
}

.cart-item__row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.cart-item__info {
  flex: 2;
}

.cart-item__info h4 {
  margin: 0 0 4px 0;
  color: #D4511A;
  font-size: 14px;
  font-weight: 600;
}

.item-variation {
  margin: 0;
  font-size: 11px;
  color: #666;
}

.item-description {
  margin: 4px 0 0 0;
  font-size: 11px;
  color: #999;
}

.cart-item__quantity {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  background: white;
}

.cart-item__quantity button {
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  color: #D4511A;
  font-weight: 700;
  font-size: 14px;
}

.cart-item__quantity button:hover {
  background-color: #F8F6F3;
}

.cart-item__quantity input {
  width: 35px;
  border: none;
  text-align: center;
  font-weight: 700;
  font-size: 13px;
}

.cart-item__price {
  font-weight: 700;
  color: #D4511A;
  min-width: 70px;
  text-align: right;
  font-size: 14px;
  padding-top: 4px;
}

.cart-item__remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #C84C3D;
  font-size: 16px;
  padding: 4px 4px;
  transition: transform 0.2s;
}

.cart-item__remove:hover {
  transform: scale(1.1);
}

.cart-item__extras {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px dashed #E0E0E0;
}
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: white;
}
.extra-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0 6px 20px;
  font-size: 12px;
  color: #666;
}

.extra-info {
  flex: 2;
  display: flex;
  align-items: center;
  gap: 6px;
}

.extra-icon {
  color: #D4511A;
  font-weight: bold;
  font-size: 12px;
}

.extra-name {
  font-size: 12px;
  color: #555;
}

.extra-quantity {
  min-width: 50px;
  text-align: center;
  color: #888;
  font-size: 11px;
}

.extra-price {
  min-width: 70px;
  text-align: right;
  font-weight: 500;
  color: #D4511A;
  font-size: 12px;
}

.extra-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #C84C3D;
  font-size: 12px;
  padding: 4px;
  transition: transform 0.2s;
}

.extra-remove:hover {
  transform: scale(1.1);
}

.cart-modal__summary {
  padding: 20px;
  border-top: 1px solid #E0E0E0;
  background-color: #F8F6F3;
  position: sticky;
  bottom: 0;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.summary-line.free-delivery {
  color: #4CAF50;
  font-weight: 500;
  font-size: 12px;
  background: #E8F5E9;
  padding: 6px 12px;
  border-radius: 8px;
  margin: 8px 0;
}

.summary-line.total {
  font-weight: 700;
  font-size: 16px;
  color: #D4511A;
  border-top: 2px solid #E0E0E0;
  padding-top: 12px;
  margin-top: 12px;
}

.summary-line select {
  padding: 6px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 13px;
  background: white;
}

.cart-modal__customer-info {
  padding: 20px;
  border-top: 1px solid #E0E0E0;
}

.cart-modal__customer-info h3 {
  margin-top: 0;
  color: #D4511A;
  font-size: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #2C2C2C;
  font-size: 13px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border: 2px solid #D4511A;
  box-shadow: 0 0 0 3px rgba(212, 81, 26, 0.1);
}

.btn {
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
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

.btn--full {
  width: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cart-modal__auth-required {
  padding: 40px 20px;
  text-align: center;
  color: #2C2C2C;
}

.cart-modal__auth-required .btn {
  margin-top: 20px;
  display: inline-block;
  padding: 12px 24px;
}

@media (max-width: 768px) {
  .cart-modal {
    padding: 0;
  }

  .cart-modal__content {
    max-width: 100%;
    border-radius: 12px 12px 0 0;
    max-height: 100vh;
  }

  .cart-item__row {
    flex-wrap: wrap;
  }

  .cart-item__info {
    flex: 1 1 100%;
    margin-bottom: 8px;
  }

  .cart-item__quantity {
    order: 2;
  }

  .cart-item__price {
    order: 3;
    margin-left: auto;
  }

  .cart-item__remove {
    order: 4;
  }

  .extra-row {
    padding-left: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .extra-info {
    flex: 1 1 100%;
  }

  .extra-quantity {
    margin-left: 20px;
  }
}

/* Animações do Carrinho */
.cart-fade-enter-active,
.cart-fade-leave-active {
  transition: opacity 0.25s ease;
}
.cart-fade-enter-from,
.cart-fade-leave-to {
  opacity: 0;
}

.cart-slide-enter-active,
.cart-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.cart-slide-enter-from,
.cart-slide-leave-to {
  transform: translateX(40px);
}
</style>