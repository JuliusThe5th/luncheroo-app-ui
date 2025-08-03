<template>
  <header class="dashboard-header">
    <img src="../assets/images/logo-no-background.png" alt="Logo" class="dashboard-logo" />
  </header>
</template>

<style scoped>
.dashboard-header {
  background: rgb(174, 174, 174);
  box-shadow: 0 2px 8px rgba(239,68,68,0.08);
  text-align: center;
  padding: 40px 0 24px 0;
  border-radius: 0 0 32px 32px;
}

header img {
  width: 200px;
  height: auto;
}

header img:hover {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

@media (max-width: 640px) {
  .dashboard-header {
    padding: 24px 0 12px 0;
    border-radius: 0 0 18px 18px;
  }
}
</style>