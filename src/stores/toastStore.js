import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: []
  }),
  
  actions: {
    addToast(message, type = 'info', duration = 3000) {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, message, type, duration });
      
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
      
      return id;
    },
    
    removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index !== -1) {
        this.toasts.splice(index, 1);
      }
    },
    
    success(message, duration) {
      return this.addToast(message, 'success', duration);
    },
    
    error(message, duration) {
      return this.addToast(message, 'error', duration);
    },
    
    warning(message, duration) {
      return this.addToast(message, 'warning', duration);
    },
    
    info(message, duration) {
      return this.addToast(message, 'info', duration);
    }
  }
});