<template>
  <div class="app">
    <Header />
    <main>
      <router-view />
      <Toast />
    </main>
  </div>
</template>

<script setup>
import Header from './components/Shared/Header.vue';
import Toast from './components/Toast.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  color: #1A1A1A;
  background-color: #FFFFFF;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>