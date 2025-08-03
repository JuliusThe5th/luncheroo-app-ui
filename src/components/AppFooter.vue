<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-copyright">
        <p>© {{ currentYear }} Luncheroo. In cooperation with ITG.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.app-footer {
  padding: 20px 0;
  background: rgb(174, 174, 174);
  border-top: 1px solid var(--color-border);
  font-size: 13px;
  color: white;
  margin-top: auto;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.04);
}

.footer-container {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-copyright {
  font-size: 20px;
}

@media (max-width: 640px) {
  .footer-copyright {
    border-radius: 12px 12px 0 0;
    padding: 12px 0;
    font-size: 0.85rem;
  }
}
</style>
