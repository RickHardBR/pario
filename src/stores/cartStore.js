import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "./authStore";
import { configService } from "../services/configService";

export const useCartStore = defineStore("cart", () => {
  // State
  const items = ref([]);
  const deliveryFee = ref(0);
  const freeDeliveryMin = ref(0);
  const deliveryAddress = ref("");
  const deliveryReference = ref("");
  const isLoading = ref(false);
  const error = ref(null);
  const customMessage = ref('Obrigado pela preferência!');

  // Computed
  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const extrasTotal = (item.extras || []).reduce((extraSum, extra) => {
        return extraSum + extra.price * (extra.quantity || 1);
      }, 0);
      return sum + itemTotal + extrasTotal;
    }, 0);
  });

  const total = computed(() => {
    let totalValue = subtotal.value;
    // Se subtotal for maior que o mínimo para entrega grátis, não cobra taxa
    if (freeDeliveryMin.value > 0 && subtotal.value >= freeDeliveryMin.value) {
      return totalValue;
    }
    return totalValue + deliveryFee.value;
  });

  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const freeDeliveryMessage = computed(() => {
    if (freeDeliveryMin.value === 0) return null;
    const remaining = freeDeliveryMin.value - subtotal.value;
    if (remaining <= 0) return "🎉 Entrega grátis!";
    return `💰 Faltam R$ ${remaining.toFixed(2).replace(".", ",")} para entrega grátis`;
  });

  // Actions
  const loadDeliveryConfig = async () => {
    const { fee, freeMin, customMessage: msg } = await configService.getDeliveryFee();
    deliveryFee.value = fee;
    freeDeliveryMin.value = freeMin;
    customMessage.value = msg;
  };

  const addItem = (product, quantity = 1, variation = null, extras = []) => {
    // ID base do item (inclui variação e extras)
    const extrasKey = extras
      .map((e) => e.id)
      .sort()
      .join("-");
    const itemId = `${product.id}-${variation?.name || "default"}-${extrasKey}`;

    // Verificar se o item já existe (com os mesmos extras)
    const existingItem = items.value.find((item) => item.id === itemId);

    // Preparar os extras no formato que o CartModal espera
    const formattedExtras = extras.map((extra) => ({
      id: extra.id,
      name: extra.name,
      price: extra.price,
      quantity: quantity,
    }));

    if (existingItem) {
      // Aumenta a quantidade do item existente
      existingItem.quantity += quantity;

      // Atualiza a quantidade dos extras
      if (existingItem.extras) {
        existingItem.extras.forEach((extra) => {
          extra.quantity += quantity;
        });
      }
    } else {
      // Adiciona novo item
      items.value.push({
        id: itemId,
        productId: product.id,
        name: product.name,
        description: product.description,
        price: variation?.price || product.price,
        quantity: quantity,
        variation: variation?.name || null,
        extras: formattedExtras,
      });
    }
  };

  const removeItem = (itemId) => {
    const index = items.value.findIndex((item) => item.id === itemId);
    if (index > -1) {
      items.value.splice(index, 1);
    }
  };

  const updateQuantity = (itemId, quantity) => {
    const item = items.value.find((i) => i.id === itemId);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
  };

  const addExtra = (itemId, extra) => {
    const item = items.value.find((i) => i.id === itemId);
    if (item) {
      const existingExtra = item.extras.find((e) => e.id === extra.id);
      if (existingExtra) {
        existingExtra.quantity += 1;
      } else {
        item.extras.push({
          id: extra.id,
          name: extra.name,
          price: extra.price,
          quantity: 1,
        });
      }
    }
  };

  const removeExtra = (itemId, extraId) => {
    const item = items.value.find((i) => i.id === itemId);
    if (item) {
      const index = item.extras.findIndex((e) => e.id === extraId);
      if (index > -1) {
        item.extras.splice(index, 1);
      }
    }
  };

  const setDeliveryFee = (fee) => {
    deliveryFee.value = fee;
  };

  const setDeliveryInfo = (address, reference = "") => {
    deliveryAddress.value = address;
    deliveryReference.value = reference;
  };

  const clearCart = () => {
    items.value = [];
    deliveryFee.value = 0;
    freeDeliveryMin.value = 0;
    deliveryAddress.value = "";
    deliveryReference.value = "";
  };

  const createOrder = async (notes = "", paymentMethod = "") => {
    isLoading.value = true;
    error.value = null;

    const authStore = useAuthStore();

    if (!authStore.user) {
      error.value = "Você precisa estar autenticado para fazer um pedido";
      isLoading.value = false;
      return { success: false };
    }

    try {
      // 1. Criar pedido
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: authStore.user.id,
            order_number: `PIO-${Date.now()}`,
            subtotal: subtotal.value,
            delivery_fee: deliveryFee.value,
            total: total.value,
            delivery_address:
              deliveryAddress.value || authStore.userProfile?.address,
            delivery_reference:
              deliveryReference.value || authStore.userProfile?.reference,
            payment_method: paymentMethod,
            status: "pending",
            notes,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Criar itens do pedido
      const orderItemsData = items.value.map((item) => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        variation_name: item.variation,
      }));

      const { data: createdItems, error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsData)
        .select();

      if (itemsError) throw itemsError;

      // 3. Criar extras do pedido
      const orderExtrasData = [];

      items.value.forEach((item, itemIndex) => {
        const orderItemId = createdItems[itemIndex]?.id;

        if (item.extras && item.extras.length > 0) {
          item.extras.forEach((extra) => {
            orderExtrasData.push({
              order_item_id: orderItemId,
              extra_id: extra.id,
              extra_name: extra.name,
              extra_price: extra.price,
              quantity: extra.quantity || item.quantity,
            });
          });
        }
      });

      if (orderExtrasData.length > 0) {
        const { error: extrasError } = await supabase
          .from("order_item_extras")
          .insert(orderExtrasData);

        if (extrasError) throw extrasError;
      }

      for (const item of items.value) {
        // Buscar o produto atual
        const { data: product } = await supabase
          .from("products")
          .select("sales_count")
          .eq("id", item.productId)
          .single();

        // Incrementar sales_count
        const newCount = (product?.sales_count || 0) + item.quantity;

        await supabase
          .from("products")
          .update({ sales_count: newCount })
          .eq("id", item.productId);
      }

      clearCart();

      return {
        success: true,
        orderId: orderData.id,
        orderNumber: orderData.order_number,
        order: orderData,
      };
    } catch (err) {
      error.value = err.message;
      console.error("Erro ao criar pedido:", err);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  const init = async () => {
    await loadDeliveryConfig();
  };

  return {
    // State
    items,
    deliveryFee,
    freeDeliveryMin,
    deliveryAddress,
    deliveryReference,
    isLoading,
    error,
    customMessage,
    // Computed
    subtotal,
    total,
    itemCount,
    freeDeliveryMessage,
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    addExtra,
    removeExtra,
    setDeliveryFee,
    setDeliveryInfo,
    clearCart,
    createOrder,
    loadDeliveryConfig,
    init,
  };
});
