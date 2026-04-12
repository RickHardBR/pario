<template>
  <div class="products-container">
    <!-- Carregando -->
    <div v-if="productsStore.isLoading" class="loading">
      <p>Carregando produtos...</p>
    </div>

    <!-- Erro -->
    <div v-else-if="productsStore.error" class="error">
      <p>{{ productsStore.error }}</p>
    </div>

    <!-- Produtos -->
    <div v-else class="products-list">
      <div v-for="category in productsStore.productsByCategory" :key="category.id" class="category-section">
        <h2 class="category-title">{{ category.name }}</h2>
        <p v-if="category.description" class="category-description">{{ category.description }}</p>

        <div class="products-grid">
          <div v-for="product in category.products" :key="product.id" class="product-card">
            <!-- Imagem -->
            <div class="product-image">
              <img v-if="product.image_url" :src="product.image_url" :alt="product.name" />
              <div v-else class="no-image">
                <span>📷 Sem imagem</span>
              </div>
              <span v-if="product.badge" class="product-badge">{{ product.badge }}</span>
            </div>

            <!-- Conteúdo -->
            <div class="product-content">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>

              <!-- Variações (para pizzas) -->
              <div v-if="product.product_variations && product.product_variations.length > 0" class="variations">
                <label class="variation-label">Tamanho:</label>
                <select :id="`variation-${product.id}`" v-model="selectedVariations[product.id]"
                  class="variation-select">
                  <option v-for="variation in product.product_variations" :key="variation.id" :value="variation">
                    {{ variation.name }} - {{ formatPrice(variation.price) }}
                  </option>
                </select>
              </div>
              <!-- Preço - APENAS para produtos SEM variações (não-pizzas) -->
              <div v-if="!product.product_variations || product.product_variations.length === 0" class="product-price">
                {{ formatPrice(getProductPrice(product)) }}
              </div>

              <!-- Quantidade -->
              <div class="quantity-selector">
                <button @click="decrementQuantity(product.id)" class="qty-btn">−</button>
                <input :id="`qty-${product.id}`" v-model.number="quantities[product.id]" type="number" min="0" readonly
                  class="qty-input" />
                <button @click="incrementQuantity(product.id)" class="qty-btn">+</button>
              </div>

              <!-- Botão Adicionar -->
              <button @click="handleAddToCart(product)" class="btn btn--primary btn--small"
                :disabled="(quantities[product.id] || 0) === 0">
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductsStore } from '../../stores/productsStore';
import { useCartStore } from '../../stores/cartStore';
import { getProductPrice, formatPrice } from '../../utils/priceUtils';


const productsStore = useProductsStore();
const cartStore = useCartStore();

const quantities = ref({});
const selectedAdditionals = ref({});
const additionalsTotal = ref({});

const incrementQuantity = (productId) => {
  quantities.value[productId] = (quantities.value[productId] || 0) + 1;
};

const decrementQuantity = (productId) => {
  if ((quantities.value[productId] || 0) > 0) {
    quantities.value[productId] -= 1;
  }
};

const handleAdditionalsUpdate = (productId, additionals) => {
  selectedAdditionals.value[productId] = additionals;
};

const handleAdditionalsTotal = (productId, total) => {
  additionalsTotal.value[productId] = total;
};

const handleAddToCart = (product) => {
  const quantity = quantities.value[product.id] || 0;
  if (quantity === 0) return;

  const variation = selectedVariations.value[product.id] || null;
  const additionals = selectedAdditionals.value[product.id] || [];
  const additionalsPrice = additionalsTotal.value[product.id] || 0;

  // Adicionar ao carrinho com adicionais
  cartStore.addItem(product, quantity, variation, additionals, additionalsPrice);

  // Resetar quantidade e adicionais
  quantities.value[product.id] = 0;
  selectedAdditionals.value[product.id] = [];
  additionalsTotal.value[product.id] = 0;

  // Mostrar feedback
  alert(`${product.name} adicionado ao carrinho!`);
};

onMounted(() => {
  if (productsStore.products.length === 0) {
    productsStore.fetchAllProducts();
  }

  // Inicializar variações com primeira opção
  productsStore.products.forEach(product => {
    if (product.product_variations && product.product_variations.length > 0) {
      selectedVariations.value[product.id] = product.product_variations[0];
    }
  });
});
</script>

<style scoped>
.products-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error {
  color: #c62828;
  background-color: #ffebee;
  border-radius: 8px;
}

.category-section {
  margin-bottom: 60px;
}

.category-title {
  font-size: 32px;
  color: #D4511A;
  margin-bottom: 10px;
}

.category-description {
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: #C84C3D;
  color: #FFFFFF;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.product-content {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 18px;
  color: #D4511A;
  margin-bottom: 8px;
}

.product-description {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  flex-grow: 1;
}

.variations {
  margin-bottom: 12px;
}

.variation-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #2C2C2C;
  margin-bottom: 6px;
}

.variation-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: #D4511A;
  margin-bottom: 12px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  width: fit-content;
}

.qty-btn {
  background: none;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 16px;
  color: #D4511A;
  font-weight: 700;
  transition: all 0.2s;
}

.qty-btn:hover {
  background-color: #F8F6F3;
}

.qty-input {
  width: 35px;
  border: none;
  text-align: center;
  font-weight: 700;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
}

.btn--primary {
  background: linear-gradient(135deg, #FFD700 0%, #E6C200 100%);
  color: #1A1A1A;
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 81, 26, 0.4);
}

.btn--small {
  padding: 8px 12px;
  font-size: 12px;
  width: 100%;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .product-image {
    height: 150px;
  }

  .product-content {
    padding: 16px;
  }

  .category-title {
    font-size: 24px;
  }
}

/* Estilo para cards de destaque (simplificados) */
.product-card--destaque {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card--destaque .product-content {
  flex-grow: 1;
}

.product-card--destaque .btn {
  margin-top: auto;
}

/* Destaque quando produto é selecionado */
.highlight-product {
  animation: highlightPulse 1.5s ease-in-out;
}

@keyframes highlightPulse {
  0% {
    background-color: transparent;
  }

  50% {
    background-color: rgba(210, 105, 30, 0.15);
  }

  100% {
    background-color: transparent;
  }
}
</style>