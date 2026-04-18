<template>
  <div v-if="filteredAdditionals.length > 0" class="product-additionals">
    <h5 class="additionals-title">Adicionais</h5>
    <div class="additionals-list">
      <label v-for="extra in filteredAdditionals" :key="extra.id" class="additional-item">
        <input
          type="checkbox"
          :value="extra"
          v-model="selectedAdditionals"
          @change="updateTotal"
        />
        <span class="additional-name">{{ extra.name }}</span>
        <span class="additional-price">{{ formatPrice(extra.price) }}</span>
      </label>
    </div>
    <div v-if="selectedAdditionals.length > 0" class="additionals-total">
      Total adicionais: {{ formatPrice(additionalsTotal) }}
    </div>
  </div>
  <div v-else-if="allAdditionalsLoaded && filteredAdditionals.length === 0" class="no-additionals">
    Nenhum adicional disponível para este tamanho
  </div>
  <div v-else class="loading-additionals">
    Carregando adicionais...
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { supabase } from '../../lib/supabaseClient';
import { formatPrice } from '../../utils/priceUtils';

const props = defineProps({
  productId: {
    type: String,
    required: true
  },
  categoryId: {
    type: String,
    required: true
  },
  selectedSize: {
    type: Object,
    default: null
  },
  productName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:additionals', 'update:additionalsTotal']);

const allAdditionals = ref([]);
const allAdditionalsLoaded = ref(false);
const selectedAdditionals = ref([]);
const additionalsTotal = ref(0);

// Filtrar adicionais localmente baseado no tamanho e nome do produto
const filteredAdditionals = computed(() => {
  // Se for pizza doce (ex: Chocolate), não adicionar Catupiry, Cheddar ou Cream Cheese
  const isDoce = props.productName.toLowerCase().includes('chocolate') || 
                 props.productName.toLowerCase().includes('doce') ||
                 props.productName.toLowerCase().includes('brigadeiro') ||
                 props.productName.toLowerCase().includes('confete');

  let baseAdditionals = allAdditionals.value;

  if (isDoce) {
    baseAdditionals = baseAdditionals.filter(extra => {
      const extraName = extra.name.toLowerCase();
      return !extraName.includes('catupiry') && !extraName.includes('cheddar') && !extraName.includes('cream cheese');
    });
  }

  if (!props.selectedSize || !props.selectedSize.name) {
    return baseAdditionals;
  }
  
  const sizeName = props.selectedSize.name.toLowerCase();
  return baseAdditionals.filter(extra => 
    extra.name.toLowerCase().includes(sizeName)
  );
});

// Buscar todos os adicionais da categoria uma única vez
const fetchAllAdditionals = async () => {
  try {
    const { data, error } = await supabase
      .from('product_additionals')
      .select('*')
      .eq('category_id', props.categoryId)
      .order('name');
    
    if (error) throw error;
    allAdditionals.value = data || [];
    allAdditionalsLoaded.value = true;
  } catch (err) {
    console.error('Erro ao buscar adicionais:', err);
    allAdditionals.value = [];
    allAdditionalsLoaded.value = true;
  }
};

const updateTotal = () => {
  const total = selectedAdditionals.value.reduce((sum, extra) => sum + (extra.price || 0), 0);
  additionalsTotal.value = total;
  emit('update:additionals', selectedAdditionals.value);
  emit('update:additionalsTotal', total);
};

// Limpar seleção quando o tamanho mudar
const clearSelection = () => {
  selectedAdditionals.value = [];
  additionalsTotal.value = 0;
  emit('update:additionals', []);
  emit('update:additionalsTotal', 0);
};

// Observar mudanças no tamanho selecionado e limpar seleção
watch(() => props.selectedSize?.name, () => {
  clearSelection();
});

// Buscar todos os adicionais ao montar o componente
onMounted(() => {
  fetchAllAdditionals();
});
</script>

<style scoped>
.product-additionals {
  margin-top: 0;
  padding: 12px;
  background-color: #F8F6F3;
  border-radius: 8px;
}

.additionals-title {
  font-size: 14px;
  font-weight: 600;
  color: #D4511A;
  margin: 0 0 10px 0;
}

.additionals-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.additional-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.additional-item:hover {
  background-color: #FFF3E0;
}

.additional-item input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #D4511A;
}

.additional-name {
  flex: 1;
  font-size: 13px;
  color: #333;
}

.additional-price {
  font-size: 13px;
  font-weight: 600;
  color: #D4511A;
}

.additionals-total {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #E0E0E0;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: #D4511A;
}

.no-additionals {
  margin-top: 12px;
  padding: 12px;
  background-color: #F8F6F3;
  border-radius: 8px;
  text-align: center;
  font-size: 12px;
  color: #999;
}

.loading-additionals {
  margin-top: 12px;
  padding: 12px;
  background-color: #F8F6F3;
  border-radius: 8px;
  text-align: center;
  font-size: 12px;
  color: #D4511A;
}
</style>