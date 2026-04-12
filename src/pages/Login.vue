<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo/Branding -->
      <div class="login-header">
        <h1 class="login-logo">Parió</h1>
        <p class="login-tagline">Lanches Gourmet</p>
      </div>

      <!-- Card de Login -->
      <div class="login-card">
        <h2 class="login-title">Entrar na Conta</h2>
        <p class="login-subtitle">Acesse sua conta para fazer pedidos</p>

        <!-- Formulário -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Email -->
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="seu@email.com"
              class="form-input"
              required
              @focus="clearError"
            />
          </div>

          <!-- Senha -->
          <div class="form-group">
            <label for="password" class="form-label">Senha</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Sua senha"
              class="form-input"
              required
              @focus="clearError"
            />
          </div>

          <!-- Mensagem de Erro -->
          <div v-if="authStore.error" class="error-message">
            <span class="error-icon">⚠️</span>
            <span>{{ authStore.error }}</span>
          </div>

          <!-- Botão de Envio -->
          <button
            type="submit"
            class="btn btn--primary btn--full"
            :disabled="authStore.isLoading"
          >
            <span v-if="!authStore.isLoading">🔓 Entrar na Conta</span>
            <span v-else>⏳ Entrando...</span>
          </button>
        </form>

        <!-- Divisor -->
        <div class="form-divider">
          <span>Não tem conta?</span>
        </div>

        <!-- Link para Registro -->
        <router-link to="/register" class="btn btn--secondary btn--full">
          📝 Criar Nova Conta
        </router-link>

        <!-- Link para Home -->
        <router-link to="/" class="link-home">
          ← Voltar para Home
        </router-link>
      </div>

      <!-- Benefícios Laterais (Desktop) -->
      <div class="login-benefits">
        <h3 class="benefits-title">Por que fazer login?</h3>
        
        <div class="benefits-list">
          <div class="benefit-item">
            <span class="benefit-icon">🛒</span>
            <div class="benefit-content">
              <h4>Carrinho Persistente</h4>
              <p>Seus pedidos salvos entre sessões</p>
            </div>
          </div>

          <div class="benefit-item">
            <span class="benefit-icon">📋</span>
            <div class="benefit-content">
              <h4>Histórico de Pedidos</h4>
              <p>Veja todos seus pedidos anteriores</p>
            </div>
          </div>

          <div class="benefit-item">
            <span class="benefit-icon">⚡</span>
            <div class="benefit-content">
              <h4>Checkout Rápido</h4>
              <p>Dados salvos para próximos pedidos</p>
            </div>
          </div>

          <div class="benefit-item">
            <span class="benefit-icon">🎁</span>
            <div class="benefit-content">
              <h4>Ofertas Exclusivas</h4>
              <p>Descontos e bônus para clientes cadastrados</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Background Decoration -->
    <div class="login-decoration"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

const form = ref({
  email: '',
  password: '',
});

const handleLogin = async () => {
  // Validação básica
  if (!form.value.email || !form.value.password) {
    authStore.error = 'Por favor, preencha todos os campos';
    return;
  }

  // Fazer login
  const result = await authStore.login(form.value.email, form.value.password);

  if (result.success) {
    // Redirecionar para dashboard
    router.push('/dashboard');
  }
  // Erro já é exibido pelo authStore
};

const clearError = () => {
  authStore.error = null;
};
</script>

<style scoped>
/* ===== LAYOUT PRINCIPAL ===== */
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #F8F6F3 0%, #FFFFFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  max-width: 1200px;
  width: 100%;
  align-items: center;
  z-index: 2;
}

/* ===== HEADER/LOGO ===== */
.login-header {
  text-align: center;
  margin-bottom: 30px;
  grid-column: 1 / -1;
}

.login-logo {
  font-size: 36px;
  color: #D4511A;
  margin: 0;
  font-weight: 700;
}

.login-tagline {
  font-size: 14px;
  color: #2C2C2C;
  margin: 8px 0 0 0;
  font-weight: 600;
}

/* ===== CARD DE LOGIN ===== */
.login-card {
  background: #FFFFFF;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-title {
  font-size: 28px;
  color: #D4511A;
  margin: 0 0 8px 0;
  text-align: center;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin: 0 0 30px 0;
}

/* ===== FORMULÁRIO ===== */
.login-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2C2C2C;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border: 2px solid #D4511A;
  box-shadow: 0 0 0 3px rgba(212, 81, 26, 0.1);
}

.form-input::placeholder {
  color: #999;
}

/* ===== MENSAGEM DE ERRO ===== */
.error-message {
  background-color: #FFEBEE;
  color: #C84C3D;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  border-left: 4px solid #C84C3D;
  animation: slideInDown 0.3s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-icon {
  font-size: 16px;
}

/* ===== BOTÕES ===== */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  display: inline-block;
  text-align: center;
  text-decoration: none;
  font-family: inherit;
}

.btn--primary {
  background: linear-gradient(135deg, #FFD700 0%, #E6C200 100%);
  color: #1A1A1A;
  box-shadow: 0 4px 12px rgba(212, 81, 26, 0.3);
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 81, 26, 0.4);
}

.btn--primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn--secondary {
  background: none;
  border: 2px solid #D4511A;
  color: #D4511A;
}

.btn--secondary:hover {
  background-color: #F8F6F3;
}

.btn--full {
  width: 100%;
}

/* ===== DIVISOR ===== */
.form-divider {
  text-align: center;
  margin: 30px 0;
  color: #999;
  font-size: 14px;
  position: relative;
}

.form-divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background-color: #E0E0E0;
  z-index: 0;
}

.form-divider span {
  background: #FFFFFF;
  padding: 0 12px;
  position: relative;
  z-index: 1;
}

/* ===== LINK HOME ===== */
.link-home {
  display: block;
  text-align: center;
  margin-top: 20px;
  color: #D4511A;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: color 0.3s;
}

.link-home:hover {
  color: #2C2C2C;
  text-decoration: underline;
}

/* ===== BENEFÍCIOS (DESKTOP) ===== */
.login-benefits {
  padding: 40px;
  background: rgba(212, 81, 26, 0.05);
  border-radius: 12px;
  border-left: 4px solid #D4511A;
}

.benefits-title {
  font-size: 18px;
  color: #D4511A;
  margin: 0 0 24px 0;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.benefit-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.benefit-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.benefit-content h4 {
  margin: 0;
  font-size: 14px;
  color: #2C2C2C;
  font-weight: 600;
}

.benefit-content p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #666;
}

/* ===== DECORAÇÃO DE FUNDO ===== */
.login-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle at center, rgba(212, 81, 26, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1024px) {
  .login-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .login-benefits {
    order: -1;
  }

  .login-benefits {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 24px;
  }

  .benefits-title {
    grid-column: 1 / -1;
  }

  .benefit-item {
    flex-direction: column;
    text-align: center;
  }

  .benefit-icon {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .login-page {
    padding: 20px;
  }

  .login-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .login-header {
    margin-bottom: 20px;
  }

  .login-logo {
    font-size: 28px;
  }

  .login-card {
    padding: 24px;
  }

  .login-title {
    font-size: 24px;
  }

  .login-benefits {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
  }

  .benefits-title {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .benefit-item {
    flex-direction: row;
    text-align: left;
  }

  .benefit-icon {
    font-size: 20px;
  }

  .benefit-content h4 {
    font-size: 13px;
  }

  .benefit-content p {
    font-size: 11px;
  }

  .login-decoration {
    width: 300px;
    height: 300px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }

  .login-card {
    padding: 20px;
  }

  .login-title {
    font-size: 20px;
  }

  .login-subtitle {
    font-size: 13px;
  }

  .form-input {
    padding: 10px 12px;
    font-size: 13px;
  }

  .btn {
    padding: 10px 16px;
    font-size: 13px;
  }

  .login-benefits {
    display: none;
  }

  .login-decoration {
    width: 200px;
    height: 200px;
  }
}
</style>