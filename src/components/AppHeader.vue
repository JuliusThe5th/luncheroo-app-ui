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
          <svg v-if="!isDarkMode" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg v-else class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
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
  border: none;
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

.theme-toggle:focus {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.theme-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
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

  .theme-icon {
    width: 18px;
    height: 18px;
  }
}
</style>
<script setup lang="ts">
defineProps({
  isDarkMode: Boolean
})

defineEmits(['toggle-theme'])
</script>
