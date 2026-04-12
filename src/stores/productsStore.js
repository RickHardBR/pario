import { defineStore } from 'pinia';
import { supabase } from '../lib/supabaseClient';
import { formatPrice } from '../utils/priceUtils';

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    categories: [],
    productsByCategory: {},
    destaques: [],
    loading: false,
    error: null,
    extras: [],
    pizzaSizes: [],
    pizzaCategories: [],
    pizzaPrices: []
  }),

  getters: {
    getProductsByCategory: (state) => state.productsByCategory,
    
    getCategoryById: (state) => (id) => {
      return state.categories.find(cat => cat.id === id);
    },
    
    // Getter para obter o preço bruto (número)
    getProductPrice: (state) => (product) => {
      if (!product) return 0;
      
      // Se for pizza
      if (product.pizza_category_id && product.pizza_size_id) {
        const pizzaPrice = state.pizzaPrices.find(
          pp => pp.pizza_category_id === product.pizza_category_id && 
                 pp.size_id === product.pizza_size_id
        );
        return pizzaPrice?.price || 0;
      }
      
      // Produto normal
      return product.price || 0;
    },
    
    // Getter para obter o preço formatado ( XX,XX)
    getFormattedPrice: (state) => (product) => {
      const price = state.getProductPrice(product);
      return formatPrice(price);
    },
    
    // Getter para variações de pizza
    getPizzaVariations: (state) => (product) => {
      if (!product.pizza_category_id) return [];
      
      return state.pizzaPrices
        .filter(pp => pp.pizza_category_id === product.pizza_category_id)
        .map(pp => ({
          id: pp.id,
          size_id: pp.size_id,
          size_name: state.pizzaSizes.find(s => s.id === pp.size_id)?.name,
          price: pp.price
        }));
    },
    
    // Getter para adicionais
    getProductExtras: (state) => (product) => {
      return state.extras.filter(extra => extra.category_id === product.category_id);
    }
  },

  actions: {
    async fetchCategories() {
      this.loading = true;
      this.error = null;
      try {
        const { data, error: fetchError } = await supabase
          .from('categories')
          .select(`*`)
          .order('display_order', { ascending: true });

        if (fetchError) throw fetchError;
        this.categories = data;
      } catch (err) {
        console.error('Erro ao buscar categorias:', err.message);
        this.error = 'Não foi possível carregar as categorias.';
      } finally {
        this.loading = false;
      }
    },

    async fetchPizzaData() {
      try {
        const { data: sizes, error: sizesError } = await supabase
          .from('pizza_sizes')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (sizesError) throw sizesError;
        this.pizzaSizes = sizes || [];

        const { data: categories, error: categoriesError } = await supabase
          .from('pizza_categories')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (categoriesError) throw categoriesError;
        this.pizzaCategories = categories || [];

        const { data: prices, error: pricesError } = await supabase
          .from('pizza_prices')
          .select('*');
        
        if (pricesError) throw pricesError;
        this.pizzaPrices = prices || [];
      } catch (err) {
        console.error('Erro ao buscar dados de pizza:', err.message);
      }
    },

    async fetchProducts() {
      this.loading = true;
      this.error = null;
      try {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name
            )
          `)
          .order('display_order', { ascending: true });

        if (productsError) throw productsError;
        
        this.products = (products || []).map(product => ({
          ...product,
          category_name: product.categories?.name,
          is_pizza: !!product.pizza_category_id
        }));
        
      } catch (err) {
        console.error('Erro ao buscar produtos:', err.message);
        this.products = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchExtras() {
      try {
        const { data, error: fetchError } = await supabase
          .from('product_additionals')
          .select(`
            *,
            categories (
              id,
              name
            )
          `)
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;
        this.extras = data || [];
      } catch (err) {
        console.error('Erro ao buscar adicionais:', err.message);
        this.extras = [];
      }
    },

async fetchAllProducts() {
  this.loading = true;
  this.error = null;
  try {
   
    await this.fetchPizzaData();
    
    await Promise.all([
      this.fetchCategories(),
      this.fetchProducts(),
      this.fetchExtras()
    ]);

    // Agrupar produtos por categoria
    const groupedProducts = {};
    this.categories.forEach(category => {
      groupedProducts[category.id] = {
        ...category,
        products: this.products.filter(
          product => product.category_id === category.id
        )
      };
    });

     
    this.productsByCategory = groupedProducts;
    
    this.destaques = this.products.filter(p => p.is_destaque === true);
        
  } catch (error) {
    this.error = error.message;
    console.error('❌ Erro ao buscar todos os produtos:', error);
  } finally {
    this.loading = false;
  }
},

    clearStore() {
      this.products = [];
      this.categories = [];
      this.productsByCategory = {};
      this.destaques = [];
      this.extras = [];
      this.pizzaSizes = [];
      this.pizzaCategories = [];
      this.pizzaPrices = [];
      this.error = null;
    }
  }
});