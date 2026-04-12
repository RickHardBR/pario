<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast', `toast--${toast.type}`]"
    >
      <span class="toast-icon">
        {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️' }}
      </span>
      <span class="toast-message">{{ toast.message }}</span>
      <button class="toast-close" @click="removeToast(toast.id)">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const toasts = ref([]);
let nextId = 0;

const addToast = (message, type = 'info', duration = 3000) => {
  const id = nextId++;
  toasts.value.push({ id, message, type });
  
  setTimeout(() => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  }, duration);
  
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

// Expor funções globalmente IMEDIATAMENTE
if (typeof window !== 'undefined') {
  window.toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info: (msg, duration) => addToast(msg, 'info', duration)
  };
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  max-width: 400px;
  animation: slideIn 0.3s ease;
}

.toast--success {
  border-left: 4px solid #4caf50;
  background: #f1f8e9;
}

.toast--error {
  border-left: 4px solid #f44336;
  background: #ffebee;
}

.toast--warning {
  border-left: 4px solid #ff9800;
  background: #fff3e0;
}

.toast--info {
  border-left: 4px solid #2196f3;
  background: #e3f2fd;
}

.toast-icon {
  font-size: 18px;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #999;
  padding: 0 4px;
}

.toast-close:hover {
  color: #333;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .toast-container {
    top: auto;
    bottom: 20px;
    left: 20px;
    right: 20px;
  }
  
  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>