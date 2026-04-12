<template>
  <div class="register-form">
    <h2>Criar Conta</h2>
    
    <form @submit.prevent="handleRegister">
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
          placeholder="Mínimo 6 caracteres"
          required
          minlength="6"
        />
      </div>

      <!-- Confirmar Senha -->
      <div class="form-group">
        <label for="confirmPassword">Confirmar Senha *</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          placeholder="Confirme sua senha"
          required
        />
      </div>

      <!-- Nome -->
      <div class="form-group">
        <label for="name">Nome Completo *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          placeholder="Seu nome"
          required
        />
      </div>

      <!-- Telefone -->
      <div class="form-group">
        <label for="phone">Telefone *</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          placeholder="(11) 99999-9999"
          required
        />
      </div>

      <!-- Endereço -->
      <div class="form-group">
        <label for="address">Endereço *</label>
        <input
          id="address"
          v-model="form.address"
          type="text"
          placeholder="Rua, número"
          required
        />
      </div>

      <!-- Referência -->
      <div class="form-group">
        <label for="reference">Referência (opcional)</label>
        <input
          id="reference"
          v-model="form.reference"
          type="text"
          placeholder="Próximo a..."
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
        {{ authStore.isLoading ? 'Criando conta...' : 'Criar Conta' }}
      </button>
    </form>

    <!-- Link para login -->
    <p class="form-footer">
      Já tem conta?
      <router-link to="/login">Faça login aqui</router-link>
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
  confirmPassword: '',
  name: '',
  phone: '',
  address: '',
  reference: '',
});

const handleRegister = async () => {
  // Validar senhas
  if (form.password !== form.confirmPassword) {
    authStore.error = 'As senhas não correspondem';
    return;
  }

  const result = await authStore.register(
    form.email,
    form.password,
    form.name,
    form.phone,
    form.address,
    form.reference
  );

  if (result.success) {
    router.push('/dashboard');
  }
};
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.register-form h2 {
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