<template>
  <div v-if="status" class="business-hours" :class="{ open: status.open, closed: !status.open }">
    <span class="hours-icon">🕒</span>
    <div class="hours-info">
      <strong>{{ currentDay }}</strong>
      <span>{{ status.message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { configService } from '../services/configService';

const status = ref(null);
const currentDay = ref('');
let intervalId = null;

const getCurrentDayName = () => {
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return days[new Date().getDay()];
};

const loadStatus = async () => {
  currentDay.value = getCurrentDayName();
  status.value = await configService.isOpenNow();
};

onMounted(() => {
  loadStatus();
  intervalId = setInterval(loadStatus, 60000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

</script>

<style scoped>
.business-hours {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 14px;
  width: fit-content;
  margin: 20px auto;
}

.business-hours.open {
  background: #E8F5E9;
  border: 1px solid #4CAF50;
  color: #2E7D32;
}

.business-hours.closed {
  background: #f5f2f2;
  border: 1px solid #F44336;
  color: #C62828;
}

.hours-icon {
  font-size: 18px;
}

.hours-info {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.hours-info strong {
  font-weight: 600;
}
</style>