<template>
  <div class="config-manager">
    <h1>Configurações do Sistema</h1>
    
    <!-- Configurações de WhatsApp -->
    <div class="config-section">
      <h2>📱 WhatsApp</h2>
      
      <div class="form-group">
        <label for="whatsappNumber">Número do WhatsApp para Pedidos</label>
        <input
          id="whatsappNumber"
          v-model="whatsappNumber"
          type="tel"
          placeholder="5511999999999"
          class="form-input"
        />
        <small>Formato: DDD + Número (ex: 5511999999999)</small>
      </div>
      
      <div class="button-group">
        <button @click="saveWhatsApp" class="btn btn--small btn--primary" :disabled="savingWhatsApp">
          {{ savingWhatsApp ? 'Salvando...' : 'Salvar WhatsApp' }}
        </button>
      </div>
    </div>

    <!-- Configurações de Entrega -->
    <div class="config-section">
      <h2>🚚 Taxas de Entrega</h2>
      
      <div class="form-group">
        <label for="deliveryFee">Taxa de Entrega Padrão (R$)</label>
        <input
          id="deliveryFee"
          v-model.number="deliveryFee"
          type="number"
          step="0.01"
          min="0"
          class="form-input"
        />
        <small>Valor cobrado para entregas na região padrão</small>
      </div>
      
      <div class="form-group">
        <label for="freeDeliveryMin">Entrega Grátis a partir de (R$)</label>
        <input
          id="freeDeliveryMin"
          v-model.number="freeDeliveryMin"
          type="number"
          step="0.01"
          min="0"
          class="form-input"
        />
        <small>Pedidos acima deste valor têm entrega grátis (0 = desabilitado)</small>
      </div>
      
      <div class="form-group">
        <label for="deliveryTime">Tempo Médio de Entrega (minutos)</label>
        <input
          id="deliveryTime"
          v-model.number="deliveryTime"
          type="number"
          min="0"
          class="form-input"
        />
        <small>Tempo estimado para preparo e entrega</small>
      </div>
      
      <div class="button-group">
        <button @click="saveDelivery" class="btn btn--small btn--primary" :disabled="savingDelivery">
          {{ savingDelivery ? 'Salvando...' : 'Salvar Taxas' }}
        </button>
      </div>
    </div>

    <!-- Configurações de Horário -->
    <div class="config-section">
      <h2>🕒 Horário de Funcionamento</h2>
      
      <!-- Segunda-feira -->
      <div class="day-schedule">
        <div class="day-header">
          <h3>Segunda-feira</h3>
          <label class="checkbox-label">
            <input type="checkbox" v-model="mondayClosed" />
            <span>Fechado</span>
          </label>
        </div>
        <div class="time-row" :class="{ disabled: mondayClosed }">
          <div class="form-group">
            <label>Abertura</label>
            <input v-model="mondayOpen" type="time" class="form-input" :disabled="mondayClosed" />
          </div>
          <div class="form-group">
            <label>Fechamento</label>
            <input v-model="mondayClose" type="time" class="form-input" :disabled="mondayClosed" />
          </div>
        </div>
      </div>

      <!-- Terça-feira -->
      <div class="day-schedule">
        <div class="day-header">
          <h3>Terça-feira</h3>
          <label class="checkbox-label">
            <input type="checkbox" v-model="tuesdayClosed" />
            <span>Fechado</span>
          </label>
        </div>
        <div class="time-row" :class="{ disabled: tuesdayClosed }">
          <div class="form-group">
            <label>Abertura</label>
            <input v-model="tuesdayOpen" type="time" class="form-input" :disabled="tuesdayClosed" />
          </div>
          <div class="form-group">
            <label>Fechamento</label>
            <input v-model="tuesdayClose" type="time" class="form-input" :disabled="tuesdayClosed" />
          </div>
        </div>
      </div>

      <!-- Quarta-feira -->
      <div class="day-schedule">
        <div class="day-header">
          <h3>Quarta-feira</h3>
          <label class="checkbox-label">
            <input type="checkbox" v-model="wednesdayClosed" />
            <span>Fechado</span>
          </label>
        </div>
        <div class="time-row" :class="{ disabled: wednesdayClosed }">
          <div class="form-group">
            <label>Abertura</label>
            <input v-model="wednesdayOpen" type="time" class="form-input" :disabled="wednesdayClosed" />
          </div>
          <div class="form-group">
            <label>Fechamento</label>
            <input v-model="wednesdayClose" type="time" class="form-input" :disabled="wednesdayClosed" />
          </div>
        </div>
      </div>

      <!-- Quinta-feira -->
      <div class="day-schedule">
        <div class="day-header">
          <h3>Quinta-feira</h3>
          <label class="checkbox-label">
            <input type="checkbox" v-model="thursdayClosed" />
            <span>Fechado</span>
          </label>
        </div>
        <div class="time-row" :class="{ disabled: thursdayClosed }">
          <div class="form-group">
            <label>Abertura</label>
            <input v-model="thursdayOpen" type="time" class="form-input" :disabled="thursdayClosed" />
          </div>
          <div class="form-group">
            <label>Fechamento</label>
            <input v-model="thursdayClose" type="time" class="form-input" :disabled="thursdayClosed" />
          </div>
        </div>
      </div>

      <!-- Sexta-feira -->
      <div class="day-schedule">
        <div class="day-header">
          <h3>Sexta-feira</h3>
          <label class="checkbox-label">
            <input type="checkbox" v-model="fridayClosed" />
            <span>Fechado</span>
          </label>
        </div>
        <div class="time-row" :class="{ disabled: fridayClosed }">
          <div class="form-group">
            <label>Abertura</label>
            <input v-model="fridayOpen" type="time" class="form-input" :disabled="fridayClosed" />
          </div>
          <div class="form-group">
            <label>Fechamento</label>
            <input v-model="fridayClose" type="time" class="form-input" :disabled="fridayClosed" />
          </div>
        </div>
      </div>

      <!-- Sábado -->
      <div class="day-schedule">
        <div class="day-header">
          <h3>Sábado</h3>
          <label class="checkbox-label">
            <input type="checkbox" v-model="saturdayClosed" />
            <span>Fechado</span>
          </label>
        </div>
        <div class="time-row" :class="{ disabled: saturdayClosed }">
          <div class="form-group">
            <label>Abertura</label>
            <input v-model="saturdayOpen" type="time" class="form-input" :disabled="saturdayClosed" />
          </div>
          <div class="form-group">
            <label>Fechamento</label>
            <input v-model="saturdayClose" type="time" class="form-input" :disabled="saturdayClosed" />
          </div>
        </div>
      </div>

      <!-- Domingo -->
      <div class="day-schedule">
        <div class="day-header">
          <h3>Domingo</h3>
          <label class="checkbox-label">
            <input type="checkbox" v-model="sundayClosed" />
            <span>Fechado</span>
          </label>
        </div>
        <div class="time-row" :class="{ disabled: sundayClosed }">
          <div class="form-group">
            <label>Abertura</label>
            <input v-model="sundayOpen" type="time" class="form-input" :disabled="sundayClosed" />
          </div>
          <div class="form-group">
            <label>Fechamento</label>
            <input v-model="sundayClose" type="time" class="form-input" :disabled="sundayClosed" />
          </div>
        </div>
      </div>
      
      <div class="button-group">
        <button @click="saveSchedule" class="btn btn--small btn--primary" :disabled="savingSchedule">
          {{ savingSchedule ? 'Salvando...' : 'Salvar Horários' }}
        </button>
      </div>
    </div>

    <!-- Configurações de Mensagem -->
    <div class="config-section">
      <h2>💬 Mensagem Personalizada</h2>
      
      <div class="form-group">
        <label for="customMessage">Mensagem padrão para WhatsApp</label>
        <textarea
          id="customMessage"
          v-model="customMessage"
          class="form-input"
          rows="4"
          placeholder="Obrigado por escolher a Parió! 🍔"
        ></textarea>
        <small>Esta mensagem será adicionada ao final de cada pedido</small>
      </div>
      
      <div class="button-group">
        <button @click="saveCustomMessage" class="btn btn--small btn--primary" :disabled="savingMessage">
          {{ savingMessage ? 'Salvando...' : 'Salvar Mensagem' }}
        </button>
      </div>
    </div>

    <!-- Configurações de Destaques -->
    <div class="config-section">
      <h2>⭐ Destaques</h2>
      
      <div class="form-group">
        <label for="maxDestaques">Máximo de produtos em destaque</label>
        <input
          id="maxDestaques"
          v-model.number="maxDestaques"
          type="number"
          min="1"
          max="50"
          class="form-input"
        />
        <small>Quantidade máxima de produtos que aparecerão na seção "Destaques"</small>
      </div>
      
      <div class="button-group">
        <button @click="saveMaxDestaques" class="btn btn--small btn--primary" :disabled="savingDestaques">
          {{ savingDestaques ? 'Salvando...' : 'Salvar Destaques' }}
        </button>
      </div>
    </div>
    
    <div v-if="message" :class="['alert', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { configService } from '../../services/configService';

// WhatsApp
const whatsappNumber = ref('');
const savingWhatsApp = ref(false);

// Delivery
const deliveryFee = ref(10);
const freeDeliveryMin = ref(0);
const deliveryTime = ref(45);
const savingDelivery = ref(false);

// Schedule
const mondayOpen = ref('18:00');
const mondayClose = ref('23:00');
const mondayClosed = ref(false);
const tuesdayOpen = ref('18:00');
const tuesdayClose = ref('23:00');
const tuesdayClosed = ref(false);
const wednesdayOpen = ref('18:00');
const wednesdayClose = ref('23:00');
const wednesdayClosed = ref(false);
const thursdayOpen = ref('18:00');
const thursdayClose = ref('23:00');
const thursdayClosed = ref(false);
const fridayOpen = ref('18:00');
const fridayClose = ref('23:00');
const fridayClosed = ref(false);
const saturdayOpen = ref('18:00');
const saturdayClose = ref('23:00');
const saturdayClosed = ref(false);
const sundayOpen = ref('18:00');
const sundayClose = ref('23:00');
const sundayClosed = ref(false);
const savingSchedule = ref(false);

// Message
const customMessage = ref('');
const savingMessage = ref(false);

// Destaques
const maxDestaques = ref(10);
const savingDestaques = ref(false);

// UI
const message = ref('');
const messageType = ref('success');

// Funções de salvamento individuais
const saveWhatsApp = async () => {
  savingWhatsApp.value = true;
  try {
    await configService.setWhatsAppNumber(whatsappNumber.value.replace(/\D/g, ''));
    showMessage('✅ Número do WhatsApp salvo com sucesso!', 'success');
  } catch (error) {
    showMessage(`❌ Erro: ${error.message}`, 'error');
  } finally {
    savingWhatsApp.value = false;
  }
};

const saveDelivery = async () => {
  savingDelivery.value = true;
  try {
    await configService.setDeliveryFee(deliveryFee.value);
    await configService.setFreeDeliveryMin(freeDeliveryMin.value);
    await configService.setDeliveryTime(deliveryTime.value);
    showMessage('✅ Taxas de entrega salvas com sucesso!', 'success');
  } catch (error) {
    showMessage(`❌ Erro: ${error.message}`, 'error');
  } finally {
    savingDelivery.value = false;
  }
};

const saveSchedule = async () => {
  savingSchedule.value = true;
  try {
    await configService.setMondaySchedule(mondayOpen.value, mondayClose.value, mondayClosed.value);
    await configService.setTuesdaySchedule(tuesdayOpen.value, tuesdayClose.value, tuesdayClosed.value);
    await configService.setWednesdaySchedule(wednesdayOpen.value, wednesdayClose.value, wednesdayClosed.value);
    await configService.setThursdaySchedule(thursdayOpen.value, thursdayClose.value, thursdayClosed.value);
    await configService.setFridaySchedule(fridayOpen.value, fridayClose.value, fridayClosed.value);
    await configService.setSaturdaySchedule(saturdayOpen.value, saturdayClose.value, saturdayClosed.value);
    await configService.setSundaySchedule(sundayOpen.value, sundayClose.value, sundayClosed.value);
    showMessage('✅ Horários salvos com sucesso!', 'success');
  } catch (error) {
    showMessage(`❌ Erro: ${error.message}`, 'error');
  } finally {
    savingSchedule.value = false;
  }
};

const saveCustomMessage = async () => {
  savingMessage.value = true;
  try {
    await configService.setCustomMessage(customMessage.value);
    showMessage('✅ Mensagem personalizada salva com sucesso!', 'success');
  } catch (error) {
    showMessage(`❌ Erro: ${error.message}`, 'error');
  } finally {
    savingMessage.value = false;
  }
};

const saveMaxDestaques = async () => {
  savingDestaques.value = true;
  try {
    await configService.setMaxDestaques(maxDestaques.value);
    showMessage('✅ Configuração de destaques salva com sucesso!', 'success');
  } catch (error) {
    showMessage(`❌ Erro: ${error.message}`, 'error');
  } finally {
    savingDestaques.value = false;
  }
};

const showMessage = (msg, type) => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

// Carregar todas as configurações - CORRIGIDO
const loadAllConfigs = async () => {
  // WhatsApp
  whatsappNumber.value = await configService.getWhatsAppNumber();
  
  // Taxas de Entrega - CORREÇÃO: getDeliveryFee retorna { fee, freeMin }
  const delivery = await configService.getDeliveryFee();
  deliveryFee.value = delivery.fee;
  freeDeliveryMin.value = delivery.freeMin;
  
  deliveryTime.value = await configService.getDeliveryTime();
  customMessage.value = await configService.getCustomMessage();
  maxDestaques.value = await configService.getMaxDestaques();
  
  // Carregar horários
  const monday = await configService.getMondaySchedule();
  mondayOpen.value = monday.open || '18:00';
  mondayClose.value = monday.close || '23:00';
  mondayClosed.value = monday.closed || false;
  
  const tuesday = await configService.getTuesdaySchedule();
  tuesdayOpen.value = tuesday.open || '18:00';
  tuesdayClose.value = tuesday.close || '23:00';
  tuesdayClosed.value = tuesday.closed || false;
  
  const wednesday = await configService.getWednesdaySchedule();
  wednesdayOpen.value = wednesday.open || '18:00';
  wednesdayClose.value = wednesday.close || '23:00';
  wednesdayClosed.value = wednesday.closed || false;
  
  const thursday = await configService.getThursdaySchedule();
  thursdayOpen.value = thursday.open || '18:00';
  thursdayClose.value = thursday.close || '23:00';
  thursdayClosed.value = thursday.closed || false;
  
  const friday = await configService.getFridaySchedule();
  fridayOpen.value = friday.open || '18:00';
  fridayClose.value = friday.close || '23:00';
  fridayClosed.value = friday.closed || false;
  
  const saturday = await configService.getSaturdaySchedule();
  saturdayOpen.value = saturday.open || '18:00';
  saturdayClose.value = saturday.close || '23:00';
  saturdayClosed.value = saturday.closed || false;
  
  const sunday = await configService.getSundaySchedule();
  sundayOpen.value = sunday.open || '18:00';
  sundayClose.value = sunday.close || '23:00';
  sundayClosed.value = sunday.closed || false;
};

onMounted(() => {
  loadAllConfigs();
});
</script>

<style scoped>
.config-manager {
  max-width: 900px;
  margin: 0 auto;
}

.config-manager h1 {
  color: #D4511A;
  margin-bottom: 30px;
  font-size: 24px;
}

.config-section {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e0e0e0;
}

.config-section h2 {
  color: #D4511A;
  margin-bottom: 20px;
  font-size: 18px;
  border-bottom: 2px solid #FFD700;
  padding-bottom: 8px;
  display: inline-block;
}

.day-schedule {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.day-schedule:last-child {
  border-bottom: none;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.day-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.time-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.time-row.disabled {
  opacity: 0.5;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 13px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
  margin: 0;
}

.checkbox-label span {
  margin: 0;
  font-weight: normal;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #D4511A;
  box-shadow: 0 0 0 3px rgba(212, 81, 26, 0.1);
}

.form-group small {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 11px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn--small {
  padding: 8px 16px;
  font-size: 13px;
}

.btn--primary {
  background: #D4511A;
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: #b84410;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  margin-top: 20px;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
}

.alert.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .config-section {
    padding: 16px;
  }
  
  .time-row {
    grid-template-columns: 1fr;
  }
  
  .day-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>