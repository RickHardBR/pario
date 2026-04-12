<template>
  <div class="login-form">
    <h2>Entrar na Conta</h2>
    
    <form @submit.prevent="handleLogin">
      <!-- Email -->
      <div class="form-group">
        <label for="email">Email *</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          placeholder="seu@email.com"
          required
        />
      </div>

      <!-- Senha -->
      <div class="form-group">
        <label for="password">Senha *</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="Sua senha"
          required
        />
      </div>

      <!-- Mensagem de erro -->
      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>

      <!-- Botão de envio -->
      <button
        type="submit"
        class="btn btn--primary"
        :disabled="authStore.isLoading"
      >
        {{ authStore.isLoading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>

    <!-- Link para registro -->
    <p class="form-footer">
      Não tem conta?
      <router-link to="/register">Crie uma aqui</router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
  email: '',
  password: '',
});

const handleLogin = async () => {
  const result = await authStore.login(form.email, form.password);

  if (result.success) {
    router.push('/dashboard');
  }
};
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #D4511A;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2C2C2C;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border: 2px solid #D4511A;
  box-shadow: 0 0 0 3px rgba(212, 81, 26, 0.1);
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
}

.btn--primary {
  background: linear-gradient(135deg, #FFD700 0%, #E6C200 100%);
  color: #1A1A1A;
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 81, 26, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.form-footer a {
  color: #D4511A;
  text-decoration: none;
  font-weight: 600;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>