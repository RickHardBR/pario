<template>
  <div class="product-size-selector">
    <!-- Seletor de Tamanho (APENAS para Pizzas) -->
    <div v-if="isPizza" class="size-selector-container">
      <h3 class="size-title">📏 Escolha o Tamanho</h3>
      
      <div class="sizes-grid">
        <button
          v-for="size in availableSizes"
          :key="size.id"
          @click="selectSize(size)"
          :class="['size-button', { 'size-button--active': selectedSize?.id === size.id }]"
        >
          <span class="size-name">{{ size.name }}</span>
          <span class="size-price"> {{ formatPrice(size.price) }}</span>
        </button>
      </div>
    </div>

    <!-- Componente de Adicionais (aparece APÓS selecionar tamanho) -->
    <ProductAdditionalsSelector
      v-if="selectedSize && (isPizza || isPanqueca)"
      :product-id="product.id"
      :category-id="product.category_id"
      :selected-size="selectedSize"
      @update:additionals="(additionals) => handleAdditionalsUpdate(additionals)"
      @update:additionalsTotal="(total) => handleAdditionalsTotal(total)"
    />

    <!-- Preço Total -->
    <div v-if="selectedSize" class="price-summary">
      <div class="price-row">
        <span>Preço do Produto:</span>
        <span class="price-value"> {{ formatPrice(selectedSize.price) }}</span>
      </div>
      <div v-if="additionalsTotal > 0" class="price-row">
        <span>Adicionais:</span>
        <span class="price-value"> {{ formatPrice(additionalsTotal) }}</span>
      </div>
      <div class="price-row price-row--total">
        <span>Total:</span>
        <span class="price-value price-value--total"> {{ formatPrice(totalPrice) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../lib/supabaseClient';
import ProductAdditionalsSelector from './ProductAdditionalsSelector.vue';
import { formatPrice } from '../../utils/priceUtils';

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(['update:selectedSize', 'update:totalPrice', 'update:additionals']);

// Estado Reativo
const selectedSize = ref(null);
const availableSizes = ref([]);
const additionalsTotal = ref(0);
const isLoading = ref(false);

// Computed: Verificar se é pizza ou panqueca
const isPizza = computed(() => props.product.category_name === 'Pizzas');
const isPanqueca = computed(() => props.product.category_name === 'Panquecas');

// Computed: Preço total (produto + adicionais)
const totalPrice = computed(() => {
  if (!selectedSize.value) return 0;
  return selectedSize.value.price + additionalsTotal.value;
});

// Função para buscar tamanhos disponíveis (APENAS para Pizzas)
const fetchSizes = async () => {
  if (!isPizza.value) {
    
    return;
  }

  isLoading.value = true;

  try {
    // Buscar os tamanhos disponíveis
    const { data: sizes, error: sizesError } = await supabase
      .from('pizza_sizes')
      .select('*')
      .order('display_order', { ascending: true });

    if (sizesError) throw sizesError;

    // Buscar os preços para esta categoria de pizza
    const { data: prices, error: pricesError } = await supabase
      .from('pizza_prices')
      .select(`
        id,
        price,
        size_id,
        pizza_sizes(id, name)
      `)
      .eq('pizza_category_id', props.product.pizza_category_id);

    if (pricesError) throw pricesError;

    // Mapear tamanhos com preços
    availableSizes.value = sizes.map(size => {
      const priceData = prices.find(p => p.size_id === size.id);
      return {
        id: size.id,
        name: size.name,
        price: priceData?.price || 0,
      };
    });


    // Selecionar o primeiro tamanho automaticamente
    if (availableSizes.value.length > 0) {
      selectSize(availableSizes.value[0]);
    }
  } catch (error) {
    console.error('❌ Erro ao buscar tamanhos:', error);
    availableSizes.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Função para selecionar um tamanho
const selectSize = (size) => {
  selectedSize.value = size;
  additionalsTotal.value = 0; // Reset adicionais ao trocar tamanho
  emit('update:selectedSize', size);
  emit('update:totalPrice', totalPrice.value);
};

// Função para atualizar adicionais
const handleAdditionalsUpdate = (additionals) => {
  emit('update:additionals', additionals);
};

// Função para atualizar total de adicionais
const handleAdditionalsTotal = (total) => {
  additionalsTotal.value = total;
  emit('update:totalPrice', totalPrice.value);
};

// Lifecycle: Buscar tamanhos ao montar
onMounted(fetchSizes);
</script>

<style scoped>
/* Container Principal */
.product-size-selector {
  background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* Seletor de Tamanho */
.size-selector-container {
  margin-bottom: 30px;
}

.size-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
  text-align: left;
}

/* Grid de Tamanhos */
.sizes-grid {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* Botão de Tamanho */
.size-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: 2px solid #d0d0d0;
  border-radius: 30px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}


.size-button:hover {
  border-color: #d2691e;
  background-color: #fff9f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(210, 105, 30, 0.15);
}

.size-button--active {
  border-color: #d2691e;
  background: linear-gradient(135deg, #fff9f0 0%, #fffbf5 100%);
  box-shadow: 0 4px 12px rgba(210, 105, 30, 0.25);
}

.size-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0;
}

.size-price {
  font-size: 0.85rem;
  font-weight: 700;
  color: #d2691e;
}

/* Resumo de Preço */
.price-summary {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-radius: 8px;
  padding: 16px;
  margin-top: auto; /* Empurra para o final */
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 0.95rem;
  color: #333;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.price-row:last-child {
  border-bottom: none;
}

.price-row--total {
  font-size: 1.1rem;
  font-weight: 700;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 2px solid rgba(0, 0, 0, 0.2);
}

.price-value {
  font-weight: 600;
  color: #333;
}

.price-value--total {
  font-size: 1.2rem;
  color: #d2691e;
}

/* Responsividade Mobile */
@media (max-width: 768px) {
  .product-size-selector {
    min-height: 260px;
    padding: 16px;
  }

  .size-title {
    font-size: 1.1rem;
  }

  .sizes-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
  }

  .size-button {
    padding: 12px;
  }

  .size-name {
    font-size: 0.9rem;
  }

  .size-price {
    font-size: 1rem;
  }

  .price-summary {
    padding: 12px;
    margin-top: auto;
  }

  .price-row {
    font-size: 0.9rem;
  }

  .price-row--total {
    font-size: 1rem;
  }

  .price-value--total {
    font-size: 1.1rem;
  }
}
</style>