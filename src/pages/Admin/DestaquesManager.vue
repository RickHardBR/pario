<template>
  <div class="destaques-manager">
    <div class="destaques-header">
      <h2 class="destaques-title">⭐ Gerenciar Destaques</h2>
      <p class="destaques-subtitle">Marque os produtos que deseja destacar na página inicial</p>
    </div>

    <!-- Controle de Quantidade Máxima -->
    <div class="quantity-control">
      <label for="max-destaques" class="quantity-label">Quantidade máxima de destaques:</label>
      <div class="quantity-input-group">
        <input 
          id="max-destaques"
          v-model.number="maxDestaques" 
          type="number" 
          min="1" 
          max="20"
          class="quantity-input"
          @change="updateMaxDestaques"
        />
        <span class="quantity-info">{{ destaquesSelecionados }}/{{ maxDestaques }} produtos selecionados</span>
      </div>
    </div>

    <!-- Carregando -->
    <div v-if="isLoading" class="loading-state">
      <p>Carregando produtos...</p>
    </div>

    <!-- Erro -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchProducts" class="btn-retry">Tentar Novamente</button>
    </div>

    <!-- Lista de Produtos -->
    <div v-else class="products-list">
      <!-- Filtro por Categoria -->
      <div class="category-filter">
        <button 
          v-for="category in uniqueCategories" 
          :key="category"
          @click="selectedCategory = selectedCategory === category ? null : category"
          class="filter-btn"
          :class="{ active: selectedCategory === category }"
        >
          {{ category }}
        </button>
      </div>

      <!-- Produtos -->
      <div class="products-grid">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="product-item"
        >
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <p class="product-category">{{ product.category_name }}</p>
          </div>

          <!-- Toggle Switch -->
          <div class="toggle-switch-wrapper">
            <input 
              :id="`toggle-${product.id}`"
              type="checkbox"
              class="toggle-switch"
              :checked="product.is_destaque"
              @change="toggleDestaque(product)"
            />
            <label :for="`toggle-${product.id}`" class="toggle-label"></label>
          </div>
        </div>
      </div>

      <!-- Mensagem se nenhum produto -->
      <div v-if="filteredProducts.length === 0" class="empty-state">
        <p>Nenhum produto encontrado</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/authStore';


const authStore = useAuthStore();

import { supabase } from '../../services/supabaseClient';
// Estados
const products = ref([]);
const isLoading = ref(false);
const error = ref(null);
const maxDestaques = ref(10);
const selectedCategory = ref(null);

// Computed
const uniqueCategories = computed(() => {
  const categories = new Set(products.value.map(p => p.category_name));
  return Array.from(categories).sort();
});

const filteredProducts = computed(() => {
  if (!selectedCategory.value) {
    return products.value;
  }
  return products.value.filter(p => p.category_name === selectedCategory.value);
});

const destaquesSelecionados = computed(() => {
  return products.value.filter(p => p.is_destaque).length;
});

// Funções
const fetchProducts = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // Buscar produtos com JOIN na tabela categories
    const { data, error: fetchError } = await supabase
      .from('products')
      .select(`
        id, 
        name, 
        is_destaque, 
        sales_count,
        categories(name)
      `)
      .order('categories(name)', { ascending: true })
      .order('name', { ascending: true });

    if (fetchError) throw fetchError;

    // Transformar os dados para ter category_name no nível raiz
    const transformedData = data.map(product => ({
      ...product,
      category_name: product.categories?.name || 'Sem categoria'
    }));

    products.value = transformedData;

    // Buscar configuração de máximo de destaques
    const { data: config, error: configError } = await supabase
      .from('admin_config')
      .select('max_destaques')
      .single();

    if (!configError && config) {
      maxDestaques.value = config.max_destaques;
    }
  } catch (err) {
    error.value = 'Erro ao carregar produtos: ' + err.message;
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const toggleDestaque = async (product) => {
  // Verificar limite de destaques
  const destaqueAtual = destaquesSelecionados.value;
  const estaMarquado = product.is_destaque;

  // Se vai marcar e já atingiu o limite
  if (!estaMarquado && destaqueAtual >= maxDestaques.value) {
    error.value = `Limite de ${maxDestaques.value} destaques atingido!`;
    setTimeout(() => {
      error.value = null;
    }, 3000);
    return;
  }

  try {
    // Atualizar no Supabase
    const { error: updateError } = await supabase
      .from('products')
      .update({ is_destaque: !estaMarquado })
      .eq('id', product.id);

    if (updateError) throw updateError;

    // Atualizar estado local
    product.is_destaque = !estaMarquado;
  } catch (err) {
    error.value = 'Erro ao atualizar produto: ' + err.message;
    console.error(err);
  }
};

const updateMaxDestaques = async () => {
  try {
    // Verificar se a tabela admin_config existe, se não, criar registro
    const { error: upsertError } = await supabase
      .from('admin_config')
      .upsert({ id: 1, max_destaques: maxDestaques.value }, { onConflict: 'id' });

    if (upsertError) throw upsertError;
  } catch (err) {
    error.value = 'Erro ao atualizar configuração: ' + err.message;
    console.error(err);
  }
};

// Lifecycle
onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.destaques-manager {
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 12px;
  max-width: 1000px;
}

.destaques-header {
  margin-bottom: 30px;
}

.destaques-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c2c2c;
  margin-bottom: 8px;
}

.destaques-subtitle {
  font-size: 14px;
  color: #666;
}

/* Controle de Quantidade */
.quantity-control {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border-left: 4px solid #D4511A;
}

.quantity-label {
  display: block;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 12px;
}

.quantity-input-group {
  display: flex;
  align-items: center;
  gap: 20px;
}

.quantity-input {
  width: 80px;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  transition: border-color 0.3s;
}

.quantity-input:focus {
  outline: none;
  border-color: #D4511A;
}

.quantity-info {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* Filtro de Categoria */
.category-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #ddd;
  background-color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: #D4511A;
  color: #D4511A;
}

.filter-btn.active {
  background-color: #D4511A;
  border-color: #D4511A;
  color: #fff;
}

/* Lista de Produtos */
.products-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  transition: all 0.3s;
}

.product-item:hover {
  border-color: #D4511A;
  box-shadow: 0 2px 8px rgba(212, 81, 26, 0.1);
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 4px;
}

.product-category {
  font-size: 12px;
  color: #999;
}

/* Toggle Switch */
.toggle-switch-wrapper {
  position: relative;
  width: 50px;
  height: 28px;
}

.toggle-switch {
  display: none;
}

.toggle-label {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ccc;
  border-radius: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-label::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  background-color: #fff;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: left 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch:checked + .toggle-label {
  background-color: #D4511A;
}

.toggle-switch:checked + .toggle-label::after {
  left: 24px;
}

/* Estados */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  color: #666;
}

.error-state {
  background-color: #fff3cd;
  color: #856404;
}

.btn-retry {
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #D4511A;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-retry:hover {
  background-color: #bf4817;
}

/* Responsivo */
@media (max-width: 768px) {
  .destaques-manager {
    padding: 20px;
  }

  .destaques-title {
    font-size: 22px;
  }

  .quantity-input-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .toggle-switch-wrapper {
    align-self: flex-end;
  }
}
</style>