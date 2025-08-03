<script setup>
import { RouterView } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import AppHeader from "./components/AppHeader.vue";
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <RouterView />
    <AppFooter />
  </div>
</template>

<style>
:root {
  --color-background: #fff;
  --color-background-soft: #f9fafb;
  --color-border: #f3f4f6;
  --color-heading: #ef4444;
  --color-text-light: #6b7280;
  --color-accent: #ef4444;
  --color-error: #ef4444;
  --radius-medium: 24px;
  --radius-small: 12px;
  --shadow-light: 0 4px 24px rgba(239,68,68,0.08), 0 1.5px 8px rgba(0,0,0,0.04);
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100vw;
  max-width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
  /* Add background for fallback */
  background: transparent;
}
</style>
