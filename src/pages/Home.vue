<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">

      <div class="hero__content">

        <h1 class="hero__title">Lanches Bem Feitos, Combinações Bacanas, Preço que Faz Sentido</h1>
        <p class="hero__subtitle">
          Cansado de pagar caro em lanche genérico? Parió traz 24 combinações gourmet diferentes,
          cada uma com ingredientes selecionados e preparação artesanal. De El Niño até Cordopatri —
          cada lanche é uma experiência. Pedidos 100% personalizados via WhatsApp.
        </p>
        <div class="hero__cta">
          <button @click="smoothScroll('products-section')" class="btn btn--primary">
            🚀 VER NOSSOS PRODUTOS
          </button>
        </div>
        <p class="hero__subtext">Pedidos 100% personalizados | Preparação artesanal | Ingredientes premium</p>
        <BusinessHours />
      </div>

      <div class="hero__image">

        <img src="../assets/images/logo2orange.png" alt="Logo Pario" class="logo-primary" loading="lazy" />
        <img src="../assets/images/logo2black.png" alt="Logo Pario Hover" class="logo-hover" loading="lazy" />
      </div>
    </section>

    <!-- Problem Section -->
    <section class="problem">
      <div class="problem__container">
        <h2 class="problem__title">O Problema: Você Está Cansado de Lanches Chatos e Caros</h2>
        <p class="problem__text">
          Você pede um lanche em qualquer lugar e é sempre a mesma coisa: pão genérico, recheio sem criatividade,
          tempero que parece que falta, preço absurdo. Você sabe que existe algo melhor, mas quando acha, custa uma
          fortuna.
        </p>
        <p class="problem__text">
          Resultado? Você continua comendo o mesmo lanche chato, gastando dinheiro em algo que não te satisfaz.
          Perde a oportunidade de descobrir combinações que realmente fazem diferença.
        </p>
      </div>
    </section>

    <!-- Solution Section -->
    <section class="solution">
      <div class="solution__container">
        <h2 class="solution__title">A Solução: Parió — Lanches Que Fazem Diferença</h2>
        <p class="solution__subtitle">
          Nós criamos uma metodologia única: cada lanche é uma receita pensada. Não copiamos — criamos.
        </p>
        <div class="solution__pillars">
          <div class="pillar">
            <h3>🎯 Ingredientes Premium</h3>
            <p>Selecionados com cuidado, sempre frescos e de qualidade superior.</p>
          </div>
          <div class="pillar">
            <h3>👨‍🍳 Preparação Artesanal</h3>
            <p>Feito na hora, com técnicas que garantem sabor e qualidade em cada mordida.</p>
          </div>
          <div class="pillar">
            <h3>💰 Preço Justo</h3>
            <p>Qualidade gourmet sem o preço absurdo. Você paga o que vale, não mais.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Menu de Categorias -->
    <section class="category-menu" id="products-section" ref="categoryMenuRef">
      <div class="category-menu__container">
        <!-- Botão "Todos" para mostrar destaques -->
        <button @click="selectCategory(null)" :class="{ active: selectedCategoryId === null }"
          class="category-menu__button">
          ⭐ Destaques
        </button>

        <!-- Botões de categorias do Supabase -->
        <button v-for="category in productsStore.categories" :key="category.id" @click="selectCategory(category.id)"
          :class="{ active: selectedCategoryId === category.id }" class="category-menu__button">
          {{ category.name }}
        </button>
      </div>
    </section>

    <!-- Products Section -->
    <section class="products" ref="productsRef">
      <div class="products__container">
        <h2 class="products__title">{{ dynamicTitle }}</h2>
        <p class="products__intro">{{ dynamicIntro }}</p>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading">
          <p>Carregando produtos...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
          <button @click="fetchDestaques" class="btn btn--secondary">Tentar Novamente</button>
        </div>

        <!-- Destaques Section (Only when no category selected) -->
        <div v-else-if="selectedCategoryId === null" class="destaques-section fade-in">
          <h3 class="destaques__title">⭐ Destaques - Mais Vendidos</h3>
          <p class="destaques__subtitle">Veja os produtos mais pedidos pelos nossos clientes</p>
          <div class="products-grid">
            <div v-for="product in destaques" :key="product.id" class="product-card product-card--destaque">
              <!-- Product Image (APENAS Lanches) -->
              <div v-if="product.category_name === 'Lanches' && product.image_url" class="product-image">
                <img :src="product.image_url" :alt="product.name" loading="lazy" />
                <div v-if="product.badge" class="product-badge">{{ product.badge }}</div>
              </div>

              <!-- Product Content (Simplificado) -->
              <div class="product-content">
                <h4 class="product-name">{{ product.name }}</h4>
                <p class="product-description">{{ product.description }}</p>

              </div>

              <!-- Botão "Ver Produto" -->
              <button @click="scrollToProductInCategory(product.category_name, product.id)"
                class="btn btn--primary btn--small">
                Ver Produto
              </button>
            </div>
          </div>
        </div>

        <!-- Products by Category Section -->
        <div v-else-if="selectedCategoryId !== null" class="products-by-category fade-in">
          <div v-for="category in productsStore.productsByCategory" :key="category.id">
            <div v-show="category.id === selectedCategoryId" :id="`category-${category.id}`" class="category-section">
              <h3 class="category-title"><img :src="category.images_url" :alt="category.name"></h3>

              <!-- Se for a categoria Pizzas, agrupar por pizza_category_id -->
              <template v-if="category.name === 'Pizzas'">
                <div v-for="pizzaCat in productsStore.pizzaCategories" :key="pizzaCat.id" class="pizza-group">
                  <!-- Filtrar produtos desta subcategoria de pizza -->
                  <template v-if="category.products.filter(p => p.pizza_category_id === pizzaCat.id).length > 0">
                    <div class="pizza-group__header">
                      <h4 class="pizza-group__title">{{ pizzaCat.name }}</h4>
                      <div class="pizza-group__divider"></div>
                    </div>

                    <div class="products-grid">
                      <div v-for="product in category.products.filter(p => p.pizza_category_id === pizzaCat.id)"
                        :key="product.id" :id="`product-${product.id}`" class="product-card">
                        <!-- Product Image -->
                        <div v-if="product.image_url" class="product-image">
                          <img :src="product.image_url" :alt="product.name" loading="lazy" />
                          <div v-if="product.badge" class="product-badge">{{ product.badge }}</div>
                        </div>

                        <!-- Product Content -->
                        <div class="product-content">
                          <h4 class="product-name">{{ product.name }}</h4>
                          <p class="product-description">{{ product.description }}</p>

                          <!-- APENAS UM ProductSizeSelector para Pizzas -->
                          <ProductSizeSelector :product="product"
                            @update:selectedSize="(size) => handleSizeSelected(product.id, size)"
                            @update:totalPrice="(price) => handlePriceUpdate(product.id, price)" />

                          <!-- Quantity Selector -->
                          <div class="quantity-selector">
                            <button @click="decrementQuantity(product.id)" class="qty-btn">−</button>
                            <input :id="`qty-${product.id}`" v-model.number="quantities[product.id]" type="number"
                              min="0" readonly class="qty-input" />
                            <button @click="incrementQuantity(product.id)" class="qty-btn">+</button>
                          </div>

                          <!-- Add to Cart Button -->
                          <button @click="handleAddToCart(product)" class="btn btn--primary btn--small"
                            :disabled="(quantities[product.id] || 0) === 0">
                            Adicionar ao Carrinho
                          </button>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </template>

              <!-- Outras categorias (comportamento padrão) -->
              <div v-else class="products-grid">
                <div v-for="product in category.products" :key="product.id" :id="`product-${product.id}`"
                  class="product-card">
                  <!-- Product Image -->
                  <div v-if="category.name === 'Lanches' && product.image_url" class="product-image">
                    <img :src="product.image_url" :alt="product.name" loading="lazy" />
                    <div v-if="product.badge" class="product-badge">{{ product.badge }}</div>
                  </div>

                  <!-- Product Content -->
                  <div class="product-content">
                    <h4 class="product-name">{{ product.name }}</h4>
                    <p class="product-description">{{ product.description }}</p>

                    <!-- Price para NÃO PIZZAS -->
                    <div class="product-price">
                      {{ formatPrice(product.price) }}
                    </div>

                    <!-- Quantity Selector -->
                    <div class="quantity-selector">
                      <button @click="decrementQuantity(product.id)" class="qty-btn">−</button>
                      <input :id="`qty-${product.id}`" v-model.number="quantities[product.id]" type="number" min="0"
                        readonly class="qty-input" />
                      <button @click="incrementQuantity(product.id)" class="qty-btn">+</button>
                    </div>

                    <!-- Adicionais APENAS para Panquecas -->
                    <ProductAdditionalsSelector v-if="category.name === 'Panquecas'" :product-id="product.id"
                      :category-id="product.category_id" :selected-size="null"
                      @update:additionals="(additionals) => handleAdditionalsUpdate(product.id, additionals)"
                      @update:additionalsTotal="(total) => handleAdditionalsTotal(product.id, total)" />

                    <!-- Add to Cart Button -->
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
      </div>
    </section>

    <!-- Value Stack Section -->
    <section class="value-stack">
      <div class="value-stack__container">
        <h2 class="value-stack__title">Veja Tudo Que Você Recebe</h2>
        <div class="value-stack__items">
          <div class="value-item">
            <div class="value-item__icon">🍔</div>
            <h4 class="value-item__title">Lanche Gourmet com 24 Opções</h4>
            <p class="value-item__text">Cada lanche é uma receita pensada. Não copiamos — criamos.</p>
            <p class="value-item__price">Valor: <strong> 25</strong></p>
          </div>
          <div class="value-item">
            <div class="value-item__icon">✅</div>
            <h4 class="value-item__title">Garantia de Qualidade 100%</h4>
            <p class="value-item__text">Se você não gostar, a gente refaz. Sem custo.</p>
            <p class="value-item__price">Valor: <strong> 20</strong></p>
          </div>
          <div class="value-item">
            <div class="value-item__icon">💬</div>
            <h4 class="value-item__title">Atendimento Personalizado</h4>
            <p class="value-item__text">Você fala o que quer, a gente cria.</p>
            <p class="value-item__price">Valor: <strong> 15</strong></p>
          </div>
          <div class="value-item">
            <div class="value-item__icon">⚡</div>
            <h4 class="value-item__title">Entrega Rápida e Fresca</h4>
            <p class="value-item__text">Preparado na hora, entregue quente.</p>
            <p class="value-item__price">Valor: <strong> 10</strong></p>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Proof Section -->
    <section class="social-proof">
      <div class="social-proof__container">
        <h2 class="social-proof__title">O Que Nossos Clientes Dizem</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <p class="testimonial__text">
              "Os lanches são incríveis! Chegou super rápido e quentinho. Já pedi 3 vezes essa semana!"
            </p>
            <p class="testimonial__author">— Maria Silva</p>
          </div>
          <div class="testimonial-card">
            <p class="testimonial__text">
              "Melhor lanche que já comi. A qualidade dos ingredientes é absurda. Vale cada centavo!"
            </p>
            <p class="testimonial__author">— João Santos</p>
          </div>
          <div class="testimonial-card">
            <p class="testimonial__text">
              "Atendimento impecável e comida deliciosa. Recomendo para todos os meus amigos!"
            </p>
            <p class="testimonial__author">— Ana Costa</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Final Section -->
    <section class="cta-final">
      <div class="cta-final__container">
        <h2 class="cta-final__title">Pronto Para Experimentar Qualidade com Preço Justo?</h2>
        <p class="cta-final__subtitle">
          Não deixe a oportunidade passar. Faça seu pedido agora via WhatsApp.
        </p>
        <button v-if="!authStore.isAuthenticated" @click="goToRegister" class="btn btn--primary btn--large">
          🚀 COMEÇAR AGORA
        </button>
        <button v-else @click="openCart" class="btn btn--primary btn--large">
          🛒 VER CARRINHO
        </button>
        <p class="cta-final__guarantee">
          ✅ 100% Garantido | ✅ Sem Risco | ✅ Qualidade Artesanal | ✅ Atendimento Personalizado
        </p>
      </div>
    </section>

    <!-- Toast/Snackbar Notification -->
    <div v-if="showToast" :class="['toast', `toast--${toastType}`]">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useProductsStore } from '../stores/productsStore';
import { useCartStore } from '../stores/cartStore';
import ProductAdditionalsSelector from '../components/Products/ProductAdditionalsSelector.vue';
import ProductSizeSelector from '../components/Products/ProductSizeSelector.vue';
import BusinessHours from '../components/BusinessHours.vue';
import { supabase } from '../lib/supabaseClient';
import { formatPrice } from '../utils/priceUtils';
import { configService } from '../services/configService';

// ===== REFS - Estado Reativo =====
const categoryMenuRef = ref(null);
const productsRef = ref(null);
const toastMessage = ref('');
const toastType = ref('success');
const showToast = ref(false);

const destaques = ref([]);
const selectedCategoryId = ref(null);
const isLoading = ref(false);
const error = ref(null);
const quantities = ref({});
const productAdditionals = ref({});
const selectedSizes = ref({});
const selectedPrices = ref({});
const MAX_QUANTITY_PER_PRODUCT = 10;

// ===== STORES =====
const router = useRouter();
const authStore = useAuthStore();
const productsStore = useProductsStore();
const cartStore = useCartStore();

// ===== TOAST/SNACKBAR SYSTEM =====
const displayToast = (message, type = 'success', duration = 3000) => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;

  setTimeout(() => {
    showToast.value = false;
  }, duration);
};

// ===== FUNÇÕES DE SCROLL =====
const smoothScroll = (targetId) => {
  const element = document.getElementById(targetId);
  if (element) {
    const yOffset = -100; // Offset para não ser coberto pelo menu fixo
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

// ===== COMPUTED PROPERTIES =====
const dynamicTitle = computed(() => {
  if (selectedCategoryId.value === null) return 'Conheça Nossos Destaques — O Melhor da Parió';
  const category = productsStore.categories.find(c => c.id === selectedCategoryId.value);
  if (!category) return 'Produtos Selecionados';

  const name = category.name;
  if (name === 'Lanches') return 'Conheça Nossos Lanches — 24 Opções de Puro Sabor';
  if (name === 'Pizzas') return 'Pizzas Artesanais — O Sabor que Você Merece';
  if (name === 'Bebidas') return 'Bebidas e Sucos — Refrescância na Medida Certa';
  if (name === 'Porções') return 'Nossas Porções — Crocantes e Ideais para Compartilhar';
  if (name === 'Sobremesas') return 'Doces e Sobremesas — O Final Perfeito para sua Refeição';
  if (name === 'Panquecas') return 'Panquecas Recheadas — Massa Leve e Sabor Caseiro';

  const feminineCategories = ['Pizzas', 'Bebidas', 'Panquecas', 'Sobremesas', 'Porções'];
  const isFeminine = feminineCategories.includes(name);
  const article = isFeminine ? 'Nossas' : 'Nossos';

  return `Conheça ${article} ${name} — Qualidade em Cada Item`;
});

const dynamicIntro = computed(() => {
  if (selectedCategoryId.value === null) return 'Veja os produtos mais pedidos pelos nossos clientes.';
  const category = productsStore.categories.find(c => c.id === selectedCategoryId.value);
  if (!category) return 'Qualidade artesanal em cada detalhe.';

  if (category.name === 'Lanches') return 'Cada lanche da Parió é uma combinação pensada, com ingredientes premium e sabor artesanal.';
  if (category.name === 'Pizzas') return 'Receitas exclusivas de pizzas artesanais, preparadas com massa leve e ingredientes selecionados.';
  if (category.name === 'Bebidas') return 'De sucos naturais feitos na hora e Soda Italiana refrescante até os clássicos que você já conhece.';
  if (category.name === 'Porções') return 'O acompanhamento perfeito: porções crocantes, quentinhas e ideais para compartilhar momentos.';
  if (category.name === 'Sobremesas') return 'Adoce sua experiência com nossas sobremesas artesanais feitas com carinho e ingredientes de primeira.';
  if (category.name === 'Panquecas') return 'Massa leve, recheios generosos e o sabor caseiro que faz toda a diferença.';

  const feminineCategories = ['Pizzas', 'Bebidas', 'Panquecas', 'Sobremesas', 'Porções'];
  const isFeminine = feminineCategories.includes(category.name);
  const article = isFeminine ? 'Nossas' : 'Nossos';

  return `${article} ${category.name} são preparadas com o toque especial da Parió.`;
});

// ===== FUNÇÕES DE CATEGORIA =====
const selectCategory = (categoryId) => {
  selectedCategoryId.value = categoryId;
  quantities.value = {};

  setTimeout(() => {
    // Busca o header e o menu de categorias para calcular o offset necessário
    const header = document.querySelector('.header');
    const menu = document.querySelector('.category-menu');
    const container = document.querySelector('.products__container');

    if (container) {
      // Calcula o offset dinamicamente: altura do header + altura do menu + margem de respiro
      const headerHeight = header ? header.offsetHeight : 60;
      const menuHeight = menu ? menu.offsetHeight : 60;
      const yOffset = -(headerHeight + menuHeight + 20);

      const y = container.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, 100);
};

// ===== FUNÇÃO PARA NAVEGAR ATÉ O PRODUTO NA SUA CATEGORIA =====
const scrollToProductInCategory = (categoryName, productId) => {
  const category = productsStore.categories.find(cat => cat.name === categoryName);
  if (!category) {
    displayToast(`Categoria ${categoryName} não encontrada`, 'error', 2000);
    return;
  }

  selectedCategoryId.value = category.id;
  quantities.value = {};

  setTimeout(() => {
    const productElement = document.getElementById(`product-${productId}`);
    if (productElement) {
      productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      productElement.classList.add('highlight-product');
      setTimeout(() => {
        productElement.classList.remove('highlight-product');
      }, 2000);
    }
  }, 100);
};

// ===== FUNÇÕES DE QUANTIDADE =====
const incrementQuantity = (productId) => {
  const currentQty = quantities.value[productId] || 0;

  if (currentQty >= MAX_QUANTITY_PER_PRODUCT) {
    displayToast(`Limite de ${MAX_QUANTITY_PER_PRODUCT} unidades por produto`, 'info', 2000);
    return;
  }

  quantities.value[productId] = currentQty + 1;
};

const decrementQuantity = (productId) => {
  const currentQty = quantities.value[productId] || 0;

  if (currentQty > 0) {
    quantities.value[productId] = currentQty - 1;
  }
};

// ===== FUNÇÕES DE ADICIONAIS =====
const handleAdditionalsUpdate = (productId, additionals) => {
  if (!productAdditionals.value[productId]) {
    productAdditionals.value[productId] = { additionals: [], total: 0 };
  }
  productAdditionals.value[productId].additionals = additionals;
};

const handleAdditionalsTotal = (productId, total) => {
  if (!productAdditionals.value[productId]) {
    productAdditionals.value[productId] = { additionals: [], total: 0 };
  }
  productAdditionals.value[productId].total = total;
};

// ===== FUNÇÕES PARA PIZZAS =====
const handleSizeSelected = (productId, sizeObject) => {
  selectedSizes.value[productId] = sizeObject;
  (`Pizza ${productId}: tamanho ${sizeObject.name} selecionado`);
};

const handlePriceUpdate = (productId, totalPrice) => {
  selectedPrices.value[productId] = totalPrice;
  (`Pizza ${productId}: preço total ${totalPrice}`);
};

// ===== FUNÇÕES DE CARRINHO =====
const handleAddToCart = (product) => {
  const quantity = quantities.value[product.id] || 0;

  if (quantity === 0) {
    displayToast('Por favor, selecione uma quantidade', 'info', 2000);
    return;
  }

  if (product.category_name === 'Pizzas') {
    if (!selectedSizes.value[product.id]) {
      displayToast('Por favor, selecione um tamanho para a pizza', 'error', 2000);
      return;
    }
  }

  const productAdditionalsData = productAdditionals.value[product.id] || { additionals: [], total: 0 };
  const extras = productAdditionalsData.additionals.map(extra => ({
    id: extra.id,
    name: extra.name,
    price: extra.price
  }));

  const variation = selectedSizes.value[product.id] || null;

  cartStore.addItem(product, quantity, variation, extras);

  quantities.value[product.id] = 0;
  productAdditionals.value[product.id] = { additionals: [], total: 0 };

  displayToast(`${product.name} (${quantity}x) adicionado ao carrinho! 🎉`, 'success', 2500);
};

// ===== FUNÇÕES DE FETCH =====
const fetchDestaques = async () => {
  isLoading.value = true;
  error.value = null;

  try {

    const maxDestaques = await configService.getMaxDestaques();

    const { data, error: fetchError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        image_url,
        badge,
        is_destaque,
        sales_count,
        category_id,
        pizza_category_id, 
        categories(name)
      `)
      .or('is_destaque.eq.true,sales_count.gte.5')
      .order('sales_count', { ascending: false })
      .limit(maxDestaques);

    if (fetchError) throw fetchError;

    destaques.value = data.map(product => ({
      ...product,
      category_name: product.categories?.name || 'Sem categoria'
    }));
  } catch (err) {
    error.value = `Erro ao buscar destaques: ${err.message}`;
    console.error('Erro em fetchDestaques:', err);
    displayToast('Erro ao carregar destaques', 'error', 3000);
  } finally {
    isLoading.value = false;
  }
};

// ===== FUNÇÕES DE NAVEGAÇÃO =====
const goToRegister = () => {
  router.push('/register');
};

const openCart = () => {
  window.dispatchEvent(new CustomEvent('openCart'));
};

// ===== LIFECYCLE HOOKS =====
onMounted(async () => {
  // Inicializar cartStore (carregar taxa de entrega do banco)
  await cartStore.init();

  fetchDestaques();

  if (productsStore.products.length === 0) {
    productsStore.fetchAllProducts();
  }
});

onUnmounted(() => {
  if (window.__categoryMenuObserver) {
    window.__categoryMenuObserver.disconnect();
    delete window.__categoryMenuObserver;
  }
});
</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Poppins', sans-serif;
  line-height: 1.6;
  color: var(--color-dark-gray);
  background-color: var(--color-white);
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-dark-gray);
}

p {
  margin-bottom: 1em;
}

/* 
   2. Layout Geral
    */
.home {
  background-color: var(--color-white);
  overflow-x: visible;
}

/* Containers de conteúdo */
.hero__content,
.problem__container,
.solution__container,
.products__container,
.value-stack__container,
.social-proof__container,
.cta-final__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

/* Seções */
.problem,
.solution,
.products,
.value-stack,
.social-proof,
.cta-final {
  padding: 100px 0;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-ease);
  display: inline-block;
  text-align: center;
  font-size: 14px;
  text-decoration: none;
}

.btn--primary {
  background: linear-gradient(135deg, var(--color-gold) 0%, #E6C200 100%);
  color: var(--color-dark-gray);
  box-shadow: 0 4px 12px rgba(var(--color-orange), 0.3);
}

.btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(var(--color-orange), 0.4);
}

.btn--small {
  padding: 8px 12px;
  font-size: 12px;
  width: 100%;
}

.btn--large {
  padding: 16px 40px;
  font-size: 16px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 
   4. Seções Específicas
    */

/* --- HERO SECTION --- */
.hero {
  background: linear-gradient(135deg, var(--color-orange) 0%, var(--color-dark-gray) 100%);
  color: var(--color-white);
  padding: 100px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  position: relative;
  overflow: hidden;
  margin-top: 60px;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero__content {
  flex: 1;
  z-index: 2;
  max-width: 600px;
  padding: 0 30px;
}

.hero__title {
  color: var(--color-white);
  font-size: 48px;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero__subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 18px;
  line-height: 1.8;
  margin-bottom: 30px;
}

.hero__cta {
  margin-bottom: 20px;
}

.hero__subtext {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.hero__image {
  flex: 1;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-orange) 0%, var(--color-gold) 100%);
  border-radius: 12px;
  overflow: hidden;
  height: 450px;
  /* Altura fixa para manter proporção */
  width: 100%;
  max-width: 500px;
  position: relative;
  margin-right: 20px;
  box-shadow: var(--shadow-strong);
}

.logo-primary,
.logo-hover {
  width: 300px;
  height: auto;
  max-width: 100%;
  transition: opacity 0.3s ease-in-out;
  cursor: pointer;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.logo-primary {
  opacity: 1;
  z-index: 2;
}

.logo-hover {
  opacity: 0;
  z-index: 1;
}

.hero__image:hover .logo-primary {
  opacity: 0;
}

.hero__image:hover .logo-hover {
  opacity: 1;
}

/* --- PROBLEM SECTION --- */
.problem {
  background-color: var(--color-light-beige);
}

.problem__container {
  max-width: 900px;
}

.problem__title {
  text-align: center;
  margin-bottom: 40px;
  color: var(--color-orange);
}

.problem__text {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 20px;
  color: var(--color-dark-gray);
}

/* --- SOLUTION SECTION --- */
.solution__title {
  text-align: center;
  margin-bottom: 20px;
  color: var(--color-orange);
}

.solution__intro {
  text-align: center;
  font-size: 18px;
  max-width: 800px;
  margin: 0 auto 40px;
  color: var(--color-dark-gray);
}

.solution__subtitle {
  text-align: center;
  font-size: 20px;
  margin-bottom: 40px;
  color: var(--color-dark-gray);
}

.solution__pillars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.pillar {
  background-color: var(--color-light-beige);
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  transition: var(--transition-ease);
  box-shadow: var(--shadow-light);
}

.pillar:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-medium);
  background-color: var(--color-white);
}

.pillar__icon {
  font-size: 32px;
  margin-bottom: 20px;
  color: var(--color-orange);
}

.pillar__title {
  color: var(--color-dark-gray);
  margin-bottom: 15px;
}

.pillar__text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-dark-gray);
}

.solution__conclusion {
  text-align: center;
  font-size: 18px;
  max-width: 800px;
  margin: 0 auto;
  color: var(--color-dark-gray);
}

/* --- PRODUTOS SECTION --- */
.products {
  background-color: var(--color-light-beige);
}

.products__title {
  text-align: center;
  margin-bottom: 10px;
  color: var(--color-orange);
}

.products__intro {
  text-align: center;
  font-size: 18px;
  margin-bottom: 40px;
  color: var(--color-dark-gray);
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

.products-list {
  display: flex;
  flex-direction: column;
  gap: 60px;
}

.category-section {
  margin-bottom: 40px;
}

.category-title {
  font-size: 28px;
  color: var(--color-orange);
  margin-bottom: 10px;
}

.category-title img {
  border-radius: 12px;
  box-shadow: var(--shadow-medium);
  width: auto;
  height: 100px;
  object-fit: cover;
}

@media (min-width: 380px) {
  .category-title img {
    height: 4.15rem;
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  align-items: start;
  /* Isso alinha os cards pelo topo */
}

.product-card {
  background: var(--color-white);
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-medium);
  transition: var(--transition-ease);
  display: flex;
  flex-direction: column;
  /* REMOVA height: 100% se tiver */
}

.product-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  /* REMOVA flex: 1 se tiver */
}

.product-size-selector {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-strong);
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
  color: var(--color-white);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.product-name {
  font-size: 18px;
  color: var(--color-orange);
  margin-bottom: 8px;
}

.product-description {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  flex-grow: 1;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-orange);
  margin-bottom: 12px;
}

/* Garantir que os adicionais não quebrem o layout */
.product-additionals {
  margin-top: auto;
  /* Empurra para o final do card */
}

/* Fixar altura mínima para consistência */
.size-selector-container {
  min-height: 140px;
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
  color: var(--color-orange);
  font-weight: 700;
  transition: var(--transition-ease);
}

.qty-btn:hover {
  background-color: var(--color-light-beige);
}

.qty-input {
  width: 35px;
  border: none;
  text-align: center;
  font-weight: 700;
}

/* --- VALUE STACK SECTION --- */
.value-stack {
  background-color: var(--color-white);
}

.value-stack__title {
  text-align: center;
  margin-bottom: 40px;
  color: var(--color-orange);
}

.value-stack__items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.value-item {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-light-beige) 100%);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-medium);
  text-align: center;
  transition: var(--transition-ease);
}

.value-item:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-strong);
}

.value-item__icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--color-orange);
}

.value-item__title {
  color: var(--color-dark-gray);
  margin-bottom: 12px;
}

.value-item__text {
  font-size: 14px;
  color: var(--color-dark-gray);
  margin-bottom: 12px;
  line-height: 1.6;
}

.value-item__price {
  font-size: 16px;
  color: var(--color-orange);
  font-weight: 700;
}

.value-stack__calculation {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.calculation-box {
  background-color: var(--color-light-beige);
  padding: 24px;
  border-radius: 12px;
  text-align: center;
}

.calculation-box.highlight {
  background: linear-gradient(135deg, var(--color-orange) 0%, var(--color-dark-gray) 100%);
  color: var(--color-white);
}

.calculation-label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-dark-gray);
}

.calculation-box.highlight .calculation-label {
  color: var(--color-white);
}

.calculation-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-orange);
  margin: 0;
}

.calculation-box.highlight .calculation-value {
  color: var(--color-gold);
}

/* --- SOCIAL PROOF SECTION --- */
.social-proof {
  background-color: var(--color-light-beige);
}

.social-proof__title {
  text-align: center;
  margin-bottom: 40px;
  color: var(--color-orange);
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}

.testimonial-card {
  background-color: var(--color-white);
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-medium);
  transition: var(--transition-ease);
}

.testimonial-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-strong);
}

.testimonial__stars {
  font-size: 18px;
  margin-bottom: 16px;
  color: var(--color-gold);
}

.testimonial__text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--color-dark-gray);
  margin-bottom: 16px;
  font-style: italic;
}

.testimonial__author {
  font-size: 13px;
  color: var(--color-dark-gray);
  font-weight: 600;
}

.credibility-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  text-align: center;
}

.stat__number {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-orange);
  margin: 0;
}

.stat__label {
  font-size: 12px;
  color: var(--color-dark-gray);
  margin: 8px 0 0 0;
}

/* --- CTA FINAL SECTION --- */
.cta-final {
  background-color: var(--color-dark-gray);
  color: var(--color-white);
}

.cta-final__container {
  max-width: 900px;
  text-align: center;
}

.cta-final__title {
  color: var(--color-white);
  margin-bottom: 20px;
}

.cta-final__subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 30px;
}

.cta-final__guarantee {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 20px;
}

/* 
   5. Responsividade
    */

/* Tablet e Telas Médias (max-width: 1024px) */
@media (max-width: 1024px) {
  .hero {
    display: flex !important;
    visibility: visible !important;
    flex-direction: column;
    gap: 30px;
    padding: 60px 0;
    margin-top: 60px;
    min-height: 600px;
  }

  .hero__content {
    text-align: center;
    max-width: 100%;
    padding: 0 30px;
    order: 1;
  }

  .hero__image {
    width: 100%;
    max-width: 450px;
    height: 350px;
    margin: 0 auto;
    flex: none;
    order: 2;
    display: flex !important;
  }

  .hero__title {
    font-size: 32px;
  }

  .hero__subtitle {
    font-size: 16px;
  }

  .products__container {
    margin-top: 40px;
  }

  .problem__container,
  .solution__container,
  .products__container,
  .value-stack__container,
  .social-proof__container,
  .cta-final__container {
    padding: 0 30px;
  }

  .products,
  .value-stack,
  .social-proof,
  .cta-final,
  .problem,
  .solution {
    padding: 60px 0;
  }
}

/* Mobile e Telas Pequenas (max-width: 768px) */
@media (max-width: 768px) {
  .hero {
    padding: 40px 0;
    min-height: 500px;
  }

  .hero__title {
    font-size: 28px;
  }

  .hero__image {
    max-width: 380px;
    height: 300px;
  }

  .solution__pillars {
    grid-template-columns: 1fr;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .value-stack__items,
  .testimonials-grid,
  .credibility-stats {
    grid-template-columns: 1fr;
  }

  .calculation-box {
    padding: 16px;
  }

  .calculation-value {
    font-size: 20px;
  }

  .logo-primary,
  .logo-hover {
    width: 180px;
  }
}

/* Mobile Extra Pequeno (max-width: 480px) */
@media (max-width: 480px) {
  .hero__title {
    font-size: 24px;
  }

  .hero__subtitle {
    font-size: 14px;
  }

  .hero__image {
    height: 250px;
    max-width: 300px;
  }

  .btn {
    padding: 10px 16px;
    font-size: 13px;
  }

  .hero__content,
  .problem__container,
  .solution__container,
  .products__container,
  .value-stack__container,
  .social-proof__container,
  .cta-final__container {
    padding: 0 20px;
  }
}

/* Estilos Globais para Agrupamento de Pizzas (Fora de Media Query) */
.pizza-group {
  margin-bottom: 50px;
}

.pizza-group__header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  margin-top: 40px;
}

.pizza-group__title {
  font-size: 1.6rem;
  color: var(--color-orange);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 800;
  position: relative;

  img {
    width: 100%;
    height: auto;
    border-radius: 10px;
  }
}

.pizza-group__title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 40px;
  height: 3px;
  background-color: var(--color-gold);
  border-radius: 2px;
}

.pizza-group__divider {
  height: 1px;
  background: linear-gradient(90deg, #E0E0E0 0%, transparent 100%);
  flex-grow: 1;
}

/* ===== TOAST/SNACKBAR ===== */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  animation: slideInUp 0.3s ease-out;
  max-width: 400px;
  font-size: 14px;
  line-height: 1.5;
}

.toast--success {
  background-color: #4caf50;
  color: #ffffff;
}

.toast--error {
  background-color: #d32f2f;
  color: #ffffff;
}

.toast--info {
  background-color: #2196f3;
  color: #ffffff;
}

@keyframes slideInUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .toast {
    bottom: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
}
</style>