<template>
  <div class="stock-manager">
    <div class="manager-header">
      <h1>Controle de Estoque (Disponibilidade)</h1>
      <p>Marque os produtos que <strong>não</strong> estão disponíveis para venda hoje.</p>
    </div>

    <!-- Filtros de Pesquisa -->
    <div class="filters-container" v-if="!loading">
      <div class="filter-group">
        <label>Pesquisar Produto:</label>
        <input type="text" v-model="searchQuery" placeholder="Ex: Hambúrguer Clássico..." />
      </div>
      <div class="filter-group">
        <label>Filtre por Categoria:</label>
        <select v-model="selectedCategoryId">
          <option value="">Todas as Categorias</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">Carregando produtos...</div>

    <div v-else class="categories-list">
      <div v-for="category in categoriesWithProducts" :key="category.id" class="category-block">
        <h2 class="category-title">{{ category.name }}</h2>
        
        <div class="products-grid">
          <div v-for="product in category.products" :key="product.id" 
               class="product-card" :class="{ 'out-of-stock': !product.active }">
               
            <div class="product-info">
              <span class="product-name">{{ product.name }}</span>
              <span class="product-status" :class="product.active ? 'status-ok' : 'status-bad'">
                {{ product.active ? 'Livre para venda' : 'Esgotado' }}
              </span>
            </div>

            <!-- Toggle Switch -->
            <label class="switch">
              <input type="checkbox" v-model="product.active" @change="toggleAvailability(product)">
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabaseClient';

const loading = ref(true);
const products = ref([]);
const categories = ref([]);

const searchQuery = ref('');
const selectedCategoryId = ref('');

const categoriesWithProducts = computed(() => {
  return categories.value.map(cat => ({
    ...cat,
    products: products.value.filter(p => {
      const matchCat = selectedCategoryId.value ? p.category_id === selectedCategoryId.value : true;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase());
      return p.category_id === cat.id && matchCat && matchSearch;
    }).sort((a,b) => (a.name > b.name) ? 1 : -1)
  })).filter(cat => cat.products.length > 0);
});

const loadData = async () => {
  loading.value = true;
  try {
    const { data: cats } = await supabase.from('categories').select('*').order('display_order');
    if (cats) categories.value = cats;

    // Usando a coluna 'active' já existente
    const { data: prods, error } = await supabase.from('products').select('id, name, category_id, active');
    if (error) console.error("Error fetching products:", error);
    if (prods) {
      products.value = prods.map(p => ({
        ...p,
        active: p.active === null ? true : p.active
      }));
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const toggleAvailability = async (product) => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ active: product.active })
      .eq('id', product.id);
      
    if (error) throw error;
  } catch (err) {
    alert('Erro ao atualizar estoque: ' + err.message);
    product.active = !product.active;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.stock-manager { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
.manager-header { margin-bottom: 40px; border-bottom: 2px solid #E0E0E0; padding-bottom: 20px;}
.manager-header h1 { font-size: 28px; color: #D4511A; margin: 0 0 10px 0; }
.manager-header p { color: #666; margin: 0; }
.loading { text-align: center; padding: 40px; color: #666; font-size: 18px; }

/* Filtros */
.filters-container { display: flex; gap: 20px; background: #F8F6F3; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #D4511A;}
.filter-group { display: flex; flex-direction: column; gap: 8px; flex: 1;}
.filter-group label { font-weight: 600; font-size: 14px; color: #333; }
.filter-group input, .filter-group select { padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; }
.filter-group input:focus, .filter-group select:focus { outline: none; border-color: #D4511A; }

.category-block { margin-bottom: 50px; }
.category-title { font-size: 22px; color: #333; margin-bottom: 20px; background: #eee; padding: 10px 15px; border-radius: 8px; border-left: 5px solid #FFD700;}

.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }

.product-card {
  display: flex; justify-content: space-between; align-items: center;
  background: white; border: 1px solid #ddd; padding: 15px 20px; border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: opacity 0.3s;
}
.product-card.out-of-stock { background: #fff5f5; border-color: #ffcdd2; opacity: 0.8; }

.product-info { display: flex; flex-direction: column; gap: 5px; }
.product-name { font-weight: bold; font-size: 16px; color: #333; }
.product-status { font-size: 12px; font-weight: bold; }
.status-ok { color: #2e7d32; }
.status-bad { color: #c62828; }

/* The switch - the box around the slider */
.switch { position: relative; display: inline-block; width: 50px; height: 26px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #c62828; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: #2e7d32; }
input:focus + .slider { box-shadow: 0 0 1px #2e7d32; }
input:checked + .slider:before { transform: translateX(24px); }
.slider.round { border-radius: 34px; }
.slider.round:before { border-radius: 50%; }
</style>
