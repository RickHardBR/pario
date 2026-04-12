import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/authStore';
import '../src/assets/css/theme.css'

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Verificar autenticação ao iniciar
const authStore = useAuthStore();
authStore.checkAuth();

app.mount('#app');