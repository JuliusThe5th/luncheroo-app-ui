<template>
  <header class="app-header">
    <div class="header-container">
      <div class="header-content">
        <img src="../assets/images/logo-no-background.png" alt="Luncheroo Logo" class="header-logo" />
        <button
          @click="$emit('toggle-theme')"
          class="theme-toggle"
          :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <i v-if="!isDarkMode" class="theme-icon bi bi-moon" stroke="currentColor"></i>
          <i v-else class="theme-icon bi bi-sun" stroke="currentColor"></i>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  transition: all var(--transition-normal);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) 0;
  min-height: 80px;
}

.header-logo {
  height: 64px;
  width: auto;
  max-width: 30vw;
  transition: transform var(--transition-fast);
  filter: drop-shadow(0 2px 8px rgba(239, 68, 68, 0.1));
}

.header-logo:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .header-logo {
    height: 48px;
    max-width: 60vw;
  }
}

@media (max-width: 480px) {
  .header-logo {
    height: 36px;
    max-width: 80vw;
  }
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.theme-toggle:hover {
  background: var(--bg-tertiary);
  color: var(--brand-primary);
  transform: scale(1.1);
}

.theme-toggle:active {
  outline: 2px solid var(--border-focus);
}


.theme-icon {
  display: block;
  margin: auto;
  width: 18px;
  height: 18px;
  font-size: 18px;
  transition: all var(--transition-fast);
}

/* Subtle glow effect for dark mode */
[data-theme="dark"] .theme-toggle:hover {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .header-container {
    padding: 0 var(--space-md);
  }

  .header-content {
    padding: var(--space-md) 0;
    min-height: 64px;
  }

  .theme-toggle {
    width: 40px;
    height: 40px;
  }

  .bi-moon{
    font-size: 2rem;
  }
}
</style>
<script setup lang="ts">
defineProps({
  isDarkMode: Boolean
})

defineEmits(['toggle-theme'])
</script>
