<script setup>
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import AppFooter from './components/AppFooter.vue'
import AppHeader from "./components/AppHeader.vue";

// Theme management
const isDarkMode = ref(false)

// Initialize theme from localStorage or system preference
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDarkMode.value = savedTheme ? savedTheme === 'dark' : prefersDark
  updateTheme()
})

// Update theme
function updateTheme() {
  document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

// Toggle theme
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  updateTheme()
}
</script>

<template>
  <head>
    <title>Luncheroo</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Luncheroo - Your lunch companion" />
    <link rel="icon" type="image/png" href="../assets/images/logo-no-background.png" />
    <link rel="manifest" href="../manifest.json" />
    <meta name="theme-color" content="#ef4444" />
  </head>
  <div class="app-container theme-transition">
    <AppHeader :isDarkMode="isDarkMode" @toggle-theme="toggleTheme" />
    <main class="main-content">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100vw;
  max-width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow-x: visible;
  /* Remove background so global body::before shows */
  background: transparent;
  transition: all var(--transition-normal);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Remove background decoration from .app-container::before, now handled globally */
</style>
