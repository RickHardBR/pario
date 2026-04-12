<template>
  <div class="products-manager">
    <!-- Header -->
    <div class="manager-header">
      <h1>Gerenciador de Produtos</h1>
      <button @click="showAddForm = !showAddForm" class="btn btn--primary">
        ➕ Novo Produto
      </button>
    </div>

    <!-- Formulário de Adicionar/Editar Produto -->
    <div v-if="showAddForm" class="add-product-form">
      <h2>{{ editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto' }}</h2>

      <form @submit.prevent="saveProduct" class="form">
        <!-- Categoria -->
        <div class="form-group">
          <label for="category">Categoria</label>
          <select v-model="formData.category_id" id="category" required @change="onCategoryChange">
            <option value="">Selecione uma categoria</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Nome -->
        <div class="form-group">
          <label for="name">Nome do Produto</label>
          <input v-model="formData.name" id="name" type="text" required />
        </div>

        <!-- Descrição -->
        <div class="form-group">
          <label for="description">Descrição</label>
          <textarea v-model="formData.description" id="description" rows="3"></textarea>
        </div>

        <!-- Preço para produtos normais -->
        <div v-if="!isPizzaCategory" class="form-group">
          <label for="price">Preço (R$)</label>
          <input v-model.number="formData.price" id="price" type="number" step="0.01" required />
        </div>

        <!-- Preços para Pizzas (3 tamanhos) -->
        <div v-if="isPizzaCategory" class="pizza-prices">
          <h4>Preços por Tamanho</h4>
          <div class="pizza-price-row">
            <label>Média (R$)</label>
            <input v-model.number="pizzaPrices.media" type="number" step="0.01" placeholder="0,00" />
          </div>
          <div class="pizza-price-row">
            <label>Grande (R$)</label>
            <input v-model.number="pizzaPrices.grande" type="number" step="0.01" placeholder="0,00" />
          </div>
          <div class="pizza-price-row">
            <label>Gigante (R$)</label>
            <input v-model.number="pizzaPrices.gigante" type="number" step="0.01" placeholder="0,00" />
          </div>
        </div>

        <!-- Badge -->
        <div class="form-group">
          <label for="badge">Badge (ex: Best-seller)</label>
          <input v-model="formData.badge" id="badge" type="text" />
        </div>

        <!-- Ativo -->
        <div class="form-group checkbox">
          <input v-model="formData.active" id="active" type="checkbox" />
          <label for="active">Produto Ativo</label>
        </div>

        <!-- Upload de Imagem -->
        <div class="form-group">
          <label>Imagem do Produto</label>
          <ImageUpload
            :product-id="formData.id || 'novo'"
            @image-uploaded="handleImageUploaded"
            @image-deleted="handleImageDeleted"
          />
        </div>

        <!-- Imagem Atual -->
        <div v-if="formData.image_url" class="current-image">
          <label>Imagem Atual</label>
          <div class="image-preview">
            <img :src="formData.image_url" :alt="formData.name" />
            <button type="button" @click="formData.image_url = null" class="btn btn--danger btn--small">
              Remover
            </button>
          </div>
        </div>

        <!-- Botões -->
        <div class="form-actions">
          <button type="submit" class="btn btn--primary">
            {{ editingProduct ? 'Atualizar Produto' : 'Adicionar Produto' }}
          </button>
          <button type="button" @click="cancelEdit" class="btn btn--secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- Lista de Produtos -->
    <div class="products-list">
      <h2>Produtos Cadastrados ({{ products.length }})</h2>

      <!-- Filtro por Categoria -->
      <div class="filter-section">
        <label for="filter-category">Filtrar por Categoria:</label>
        <select v-model="selectedCategory" id="filter-category">
          <option value="">Todas as Categorias</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Produtos -->
      <div class="products-grid">
        <div v-for="product in filteredProducts" :key="product.id" class="product-card">
          <!-- Imagem -->
          <div class="product-image">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="image"
            />
            <div v-else class="no-image">Sem imagem</div>
          </div>

          <!-- Informações -->
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="category">{{ getCategoryName(product.category_id) }}</p>
            <p class="description">{{ product.description }}</p>
            <p class="price">{{ getProductDisplayPrice(product) }}</p>

            <div v-if="product.badge" class="badge">{{ product.badge }}</div>

            <div class="status">
              <span v-if="product.active" class="active">✅ Ativo</span>
              <span v-else class="inactive">❌ Inativo</span>
            </div>
          </div>

          <!-- Ações -->
          <div class="product-actions">
            <button @click="editProduct(product)" class="btn btn--secondary btn--small">
              ✏️ Editar
            </button>
            <button @click="deleteProduct(product.id)" class="btn btn--danger btn--small">
              🗑️ Deletar
            </button>
          </div>
        </div>
      </div>

      <!-- Mensagem Vazia -->
      <div v-if="filteredProducts.length === 0" class="empty-state">
        <p>Nenhum produto encontrado nesta categoria.</p>
      </div>
    </div>

    <!-- Mensagens de Sucesso/Erro -->
    <div v-if="successMessage" class="success-message">
      <span>{{ successMessage }}</span>
      <button @click="successMessage = null" class="close-btn">×</button>
    </div>

    <div v-if="errorMessage" class="error-message">
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = null" class="close-btn">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabaseClient';
import ImageUpload from '../../components/Admin/ImageUpload.vue';
import { formatPrice } from '../../utils/priceUtils';

// Refs
const products = ref([]);
const categories = ref([]);
const showAddForm = ref(false);
const editingProduct = ref(null);
const selectedCategory = ref('');
const successMessage = ref(null);
const errorMessage = ref(null);
const pizzaCategoryId = ref('');
const pizzaSizes = ref([]);
const pizzaPricesMap = ref({});

const pizzaPrices = ref({
  media: 0,
  grande: 0,
  gigante: 0
});

const formData = ref({
  id: null,
  category_id: '',
  name: '',
  description: '',
  price: 0,
  badge: '',
  image_url: '',
  active: true,
});

// Computed
const filteredProducts = computed(() => {
  if (!selectedCategory.value) return products.value;
  return products.value.filter((p) => p.category_id === selectedCategory.value);
});

const isPizzaCategory = computed(() => {
  return formData.value.category_id === pizzaCategoryId.value;
});

// Métodos
const getCategoryName = (categoryId) => {
  const cat = categories.value.find((c) => c.id === categoryId);
  return cat ? cat.name : 'Desconhecida';
};

const getProductDisplayPrice = (product) => {
  if (product.category_id === pizzaCategoryId.value) {
    // Para pizzas, buscar preços dos tamanhos
    const prices = pizzaPricesMap.value[product.id];
    if (prices) {
      return `Média: ${formatPrice(prices.media)} | Grande: ${formatPrice(prices.grande)} | Gigante: ${formatPrice(prices.gigante)}`;
    }
    return formatPrice(0);
  }
  return formatPrice(product.price);
};

const loadCategories = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name');

    if (error) throw error;
    categories.value = data;
  } catch (err) {
    errorMessage.value = 'Erro ao carregar categorias: ' + err.message;
  }
};

const loadProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('display_order');

    if (error) throw error;
    products.value = data;
    
    // Carregar preços das pizzas
    await loadAllPizzaPrices();
  } catch (err) {
    errorMessage.value = 'Erro ao carregar produtos: ' + err.message;
  }
};

const loadAllPizzaPrices = async () => {
  try {
    // Buscar todos os produtos que são pizzas
    const pizzaProducts = products.value.filter(p => p.category_id === pizzaCategoryId.value);
    
    for (const product of pizzaProducts) {
      if (product.pizza_category_id) {
        const { data: prices } = await supabase
          .from('pizza_prices')
          .select('*, pizza_sizes(name)')
          .eq('pizza_category_id', product.pizza_category_id);
        
        if (prices) {
          const priceMap = { media: 0, grande: 0, gigante: 0 };
          prices.forEach(price => {
            const sizeName = price.pizza_sizes?.name?.toLowerCase();
            if (sizeName === 'média') priceMap.media = price.price;
            if (sizeName === 'grande') priceMap.grande = price.price;
            if (sizeName === 'gigante') priceMap.gigante = price.price;
          });
          pizzaPricesMap.value[product.id] = priceMap;
        }
      }
    }
  } catch (err) {
    console.error('Erro ao carregar preços das pizzas:', err);
  }
};

const loadPizzaData = async () => {
  try {
    // Buscar ID da categoria Pizzas
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Pizzas')
      .single();
    
    if (catData) {
      pizzaCategoryId.value = catData.id;
    }
    
    // Buscar tamanhos de pizza
    const { data: sizes } = await supabase
      .from('pizza_sizes')
      .select('*')
      .order('display_order');
    
    pizzaSizes.value = sizes || [];
  } catch (err) {
    console.error('Erro ao carregar dados de pizza:', err);
  }
};

const onCategoryChange = () => {
  // Resetar preços de pizza quando mudar categoria
  pizzaPrices.value = { media: 0, grande: 0, gigante: 0 };
};

const createPizzaPrices = async (productId, pizzaCategoryId) => {
  for (const size of pizzaSizes.value) {
    let price = 0;
    if (size.name === 'Média') price = pizzaPrices.value.media;
    if (size.name === 'Grande') price = pizzaPrices.value.grande;
    if (size.name === 'Gigante') price = pizzaPrices.value.gigante;
    
    await supabase
      .from('pizza_prices')
      .insert([{
        pizza_category_id: pizzaCategoryId,
        size_id: size.id,
        price: price
      }]);
  }
};

const updatePizzaPrices = async (pizzaCategoryId) => {
  for (const size of pizzaSizes.value) {
    let price = 0;
    if (size.name === 'Média') price = pizzaPrices.value.media;
    if (size.name === 'Grande') price = pizzaPrices.value.grande;
    if (size.name === 'Gigante') price = pizzaPrices.value.gigante;
    
    await supabase
      .from('pizza_prices')
      .update({ price: price })
      .eq('pizza_category_id', pizzaCategoryId)
      .eq('size_id', size.id);
  }
};

const saveProduct = async () => {
  try {
    if (!formData.value.category_id || !formData.value.name) {
      errorMessage.value = 'Preencha todos os campos obrigatórios';
      return;
    }

    if (editingProduct.value) {
      // Atualizar produto existente
      const updateData = {
        category_id: formData.value.category_id,
        name: formData.value.name,
        description: formData.value.description,
        badge: formData.value.badge,
        image_url: formData.value.image_url,
        active: formData.value.active,
        updated_at: new Date(),
      };
      
      // Se NÃO for pizza, incluir price
      if (!isPizzaCategory.value) {
        updateData.price = formData.value.price;
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', formData.value.id);

      if (error) throw error;
      
      // Se for pizza, atualizar os preços
      if (isPizzaCategory.value && editingProduct.value.pizza_category_id) {
        await updatePizzaPrices(editingProduct.value.pizza_category_id);
      }

      successMessage.value = '✅ Produto atualizado com sucesso!';
    } else {
      // Criar novo produto
      const insertData = {
        category_id: formData.value.category_id,
        name: formData.value.name,
        description: formData.value.description,
        badge: formData.value.badge,
        image_url: formData.value.image_url,
        active: formData.value.active,
        display_order: products.value.length + 1,
      };
      
      if (!isPizzaCategory.value) {
        insertData.price = formData.value.price;
      }

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      
      // Se for pizza, criar categoria e preços
      if (isPizzaCategory.value) {
        // Criar uma categoria de pizza para este produto
        const { data: pizzaCat, error: catError } = await supabase
          .from('pizza_categories')
          .insert([{ name: formData.value.name }])
          .select()
          .single();
        
        if (catError) throw catError;
        
        // Atualizar o produto com pizza_category_id
        await supabase
          .from('products')
          .update({ pizza_category_id: pizzaCat.id })
          .eq('id', newProduct.id);
        
        // Criar os preços
        await createPizzaPrices(newProduct.id, pizzaCat.id);
      }

      successMessage.value = '✅ Produto adicionado com sucesso!';
    }

    cancelEdit();
    await loadProducts();

    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (err) {
    errorMessage.value = 'Erro ao salvar produto: ' + err.message;
    console.error('❌ Erro detalhado:', err);
  }
};

const editProduct = async (product) => {
  editingProduct.value = product;
  formData.value = {
    id: product.id,
    category_id: product.category_id,
    name: product.name,
    description: product.description,
    price: product.price || 0,
    badge: product.badge,
    image_url: product.image_url,
    active: product.active,
  };
  
  // Resetar preços de pizza
  pizzaPrices.value = { media: 0, grande: 0, gigante: 0 };
  
  // Se for pizza, carregar os preços
  if (product.category_id === pizzaCategoryId.value && product.pizza_category_id) {
    const { data: prices } = await supabase
      .from('pizza_prices')
      .select('*, pizza_sizes(name)')
      .eq('pizza_category_id', product.pizza_category_id);
    
    if (prices) {
      prices.forEach(price => {
        const sizeName = price.pizza_sizes?.name?.toLowerCase();
        if (sizeName === 'média') pizzaPrices.value.media = price.price;
        if (sizeName === 'grande') pizzaPrices.value.grande = price.price;
        if (sizeName === 'gigante') pizzaPrices.value.gigante = price.price;
      });
    }
  }
  
  showAddForm.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  editingProduct.value = null;
  formData.value = {
    id: null,
    category_id: '',
    name: '',
    description: '',
    price: 0,
    badge: '',
    image_url: '',
    active: true,
  };
  pizzaPrices.value = { media: 0, grande: 0, gigante: 0 };
  showAddForm.value = false;
};

const deleteProduct = async (productId) => {
  if (!confirm('Tem certeza que deseja deletar este produto?')) return;

  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) throw error;

    successMessage.value = '✅ Produto deletado com sucesso!';
    await loadProducts();

    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (err) {
    errorMessage.value = 'Erro ao deletar produto: ' + err.message;
  }
};

const handleImageUploaded = (imageData) => {
  formData.value.image_url = imageData.url;
};

const handleImageDeleted = () => {
  formData.value.image_url = null;
};

// Lifecycle
onMounted(() => {
  loadCategories();
  loadProducts();
  loadPizzaData();
});
</script>

<style scoped>
/* ===== LAYOUT PRINCIPAL ===== */
.products-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #FFFFFF;
}

/* ===== HEADER ===== */
.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #E0E0E0;
}

.manager-header h1 {
  font-size: 28px;
  color: #D4511A;
  margin: 0;
}

/* ===== FORMULÁRIO ===== */
.add-product-form {
  background-color: #F8F6F3;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 40px;
  border-left: 4px solid #D4511A;
}

.add-product-form h2 {
  font-size: 20px;
  color: #2C2C2C;
  margin: 0 0 24px 0;
}

.form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #2C2C2C;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border: 2px solid #D4511A;
  box-shadow: 0 0 0 3px rgba(212, 81, 26, 0.1);
}

.form-group.checkbox {
  flex-direction: row;
  align-items: center;
}

.form-group.checkbox input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.form-group.checkbox label {
  margin: 0;
}

/* Preços das Pizzas */
.pizza-prices {
  grid-column: 1 / -1;
  padding: 16px;
  background-color: #FFF3E0;
  border-radius: 8px;
  border: 1px solid #FFD700;
}

.pizza-prices h4 {
  margin: 0 0 12px 0;
  color: #D4511A;
  font-size: 14px;
}

.pizza-price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.pizza-price-row label {
  width: 80px;
  font-weight: 600;
}

.pizza-price-row input {
  flex: 1;
  max-width: 150px;
}

/* ===== IMAGEM ATUAL ===== */
.current-image {
  grid-column: 1 / -1;
  padding: 16px;
  background-color: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
}

.current-image label {
  display: block;
  font-weight: 600;
  color: #2C2C2C;
  margin-bottom: 12px;
  font-size: 14px;
}

.image-preview {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.image-preview img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
}

/* ===== BOTÕES DO FORMULÁRIO ===== */
.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-family: inherit;
}

.btn--primary {
  background: linear-gradient(135deg, #FFD700 0%, #E6C200 100%);
  color: #1A1A1A;
  box-shadow: 0 4px 12px rgba(212, 81, 26, 0.3);
}

.btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 81, 26, 0.4);
}

.btn--secondary {
  background-color: #D4511A;
  color: #FFFFFF;
}

.btn--secondary:hover {
  background-color: #2C2C2C;
}

.btn--danger {
  background-color: #C84C3D;
  color: #FFFFFF;
}

.btn--danger:hover {
  background-color: #A63830;
}

.btn--small {
  padding: 6px 12px;
  font-size: 12px;
}

/* ===== FILTRO ===== */
.filter-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #F8F6F3;
  border-radius: 8px;
}

.filter-section label {
  font-weight: 600;
  color: #2C2C2C;
  font-size: 14px;
}

.filter-section select {
  padding: 8px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

/* ===== GRID DE PRODUTOS ===== */
.products-list h2 {
  font-size: 20px;
  color: #2C2C2C;
  margin: 0 0 24px 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.product-card {
  background-color: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-image {
  width: 100%;
  height: 200px;
  background-color: #F8F6F3;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image .image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image .no-image {
  color: #999;
  font-size: 14px;
}

.product-info {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-info h3 {
  font-size: 16px;
  color: #D4511A;
  margin: 0;
}

.product-info .category {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.product-info .description {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.4;
  flex-grow: 1;
}

.product-info .price {
  font-size: 14px;
  font-weight: 600;
  color: #D4511A;
  margin: 0;
  line-height: 1.5;
}

.badge {
  display: inline-block;
  background-color: #C84C3D;
  color: #FFFFFF;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  width: fit-content;
}

.status {
  font-size: 12px;
  font-weight: 600;
}

.status .active {
  color: #1B4D3E;
}

.status .inactive {
  color: #C84C3D;
}

.product-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #E0E0E0;
  background-color: #F8F6F3;
}

.product-actions .btn {
  flex: 1;
}

/* ===== ESTADO VAZIO ===== */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 16px;
}

/* ===== MENSAGENS ===== */
.success-message,
.error-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.success-message {
  background-color: #E8F5E9;
  color: #1B4D3E;
  border-left: 4px solid #1B4D3E;
}

.error-message {
  background-color: #FFEBEE;
  color: #C84C3D;
  border-left: 4px solid #C84C3D;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: inherit;
  padding: 0;
  margin-left: auto;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
  .products-manager {
    padding: 20px;
  }

  .manager-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .form {
    grid-template-columns: 1fr;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .success-message,
  .error-message {
    left: 20px;
    right: 20px;
  }
}
</style>