<template>
  <div v-if="isOpen" class="confirm-modal" @click.self="close">
    <div class="confirm-modal__content">
      <div class="confirm-modal__header">
        <h3>{{ title }}</h3>
        <button class="confirm-modal__close" @click="close">✕</button>
      </div>
      
      <div class="confirm-modal__body">
        <p>{{ message }}</p>
      </div>
      
      <div class="confirm-modal__footer">
        <button class="btn btn--secondary" @click="close">
          {{ cancelText }}
        </button>
        <button class="btn btn--primary" @click="confirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isOpen = ref(false);
let resolvePromise = null;

const open = (options = {}) => {
  title.value = options.title || 'Confirmar';
  message.value = options.message || 'Tem certeza que deseja continuar?';
  confirmText.value = options.confirmText || 'Confirmar';
  cancelText.value = options.cancelText || 'Cancelar';
  
  isOpen.value = true;
  
  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

const close = () => {
  isOpen.value = false;
  if (resolvePromise) resolvePromise(false);
};

const confirm = () => {
  isOpen.value = false;
  if (resolvePromise) resolvePromise(true);
};

const title = ref('Confirmar');
const message = ref('');
const confirmText = ref('Confirmar');
const cancelText = ref('Cancelar');

defineExpose({ open });
</script>

<style scoped>
.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-modal__content {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.confirm-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #D4511A;
  color: white;
}

.confirm-modal__header h3 {
  margin: 0;
  font-size: 18px;
}

.confirm-modal__close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.8;
}

.confirm-modal__close:hover {
  opacity: 1;
}

.confirm-modal__body {
  padding: 24px 20px;
}

.confirm-modal__body p {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.confirm-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  background: #f5f5f5;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
}

.btn--primary {
  background: #D4511A;
  color: white;
}

.btn--primary:hover {
  background: #b84410;
}

.btn--secondary {
  background: #666;
  color: white;
}

.btn--secondary:hover {
  background: #555;
}
</style>