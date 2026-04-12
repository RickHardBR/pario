// /src/utils/priceUtils.js
export const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return ' 0,00';
  }
  
  const numPrice = parseFloat(price);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numPrice);
};

export const getProductPrice = (product, selectedVariations) => {
  if (!product) return 0;
  
  const variation = selectedVariations?.[product.id];
  if (variation) return variation.price;
  
  return product.priceValue || product.price || 0;
};