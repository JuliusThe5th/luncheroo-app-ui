<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import { api } from '../utils/api.js';

const router = useRouter();
const { user, requireAuth, logout } = useAuth();
const hasLunchToday = ref(false);
const lunchNumber = ref(localStorage.getItem('lunchNumber') || 0);

const currentDate = computed(() => {
  const today = new Date();
  return today.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

onMounted(async () => {
  // Check authentication
  if (!requireAuth()) return;

  try {
    // Debug: Check what cookies we have
    console.log('Current cookies:', document.cookie);
    console.log('Making request to:', `${import.meta.env.VITE_API_URL}/api/user-info`);

    // Get user info and lunch data
    console.log('Fetching user info...');
    const userData = await api.getUserInfo();
    console.log('User data received:', userData);

    // Update user name if available
    if (userData?.name) {
      user.value.name = userData.name;
    }

    // Extract lunch information
    if (userData.lunch) {
      console.log('Lunch data:', userData.lunch);
      if (userData.lunch.hasLunch) {
        hasLunchToday.value = true;
        lunchNumber.value = userData.lunch.number;
        localStorage.setItem('lunchNumber', lunchNumber.value);
        console.log('Setting lunch number to:', userData.lunch.number);
      } else {
        hasLunchToday.value = false;
        localStorage.removeItem('lunchNumber');
        console.log('No lunch found for today');
      }
    } else {
      hasLunchToday.value = false;
      console.log('No lunch property in user data');
    }
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });

    // Continue showing dashboard with localStorage data
    const storedLunchNumber = localStorage.getItem('lunchNumber');
    if (storedLunchNumber) {
      hasLunchToday.value = true;
      lunchNumber.value = storedLunchNumber;
      console.log('Using stored lunch number:', storedLunchNumber);
    }
  }
});
</script>

<template>
  <main class="dashboard-main">
    <div class="dashboard-container">
      <div class="dashboard-card fade-in">
        <div class="dashboard-header">
          <div class="user-profile">
            <img :src="user.picture" alt="Profile" class="profile-avatar" />
            <div class="user-info">
              <h1 class="welcome-text">Welcome back!</h1>
              <h2 class="user-name">{{ user.name }}</h2>
              <p class="current-date">{{ currentDate }}</p>
            </div>
          </div>
        </div>

        <div class="dashboard-content">
          <div class="lunch-status-card">
            <div class="status-header">
              <h3>Today's Lunch Status</h3>
              <div class="status-indicator" :class="{ 'has-lunch': hasLunchToday }">
                <div class="indicator-dot"></div>
                <span>{{ hasLunchToday ? 'Active' : 'No Order' }}</span>
              </div>
            </div>

            <div class="lunch-info">
              <div v-if="hasLunchToday" class="lunch-success">
                <div class="lunch-icon">🍽️</div>
                <div class="lunch-details">
                  <h4>Lunch Confirmed</h4>
                  <p>You have lunch ordered for today</p>
                  <div class="lunch-number">
                    <span class="order-badge">Order #{{ lunchNumber }}</span>
                  </div>
                </div>
              </div>

              <div v-else class="lunch-empty">
                <div class="empty-icon">🍽️</div>
                <div class="empty-details">
                  <h4>No Lunch Today</h4>
                  <p>You don't have any lunch ordered for today</p>
                </div>
              </div>
            </div>
          </div>

          <div class="actions-section">
            <h3 class="actions-title">Quick Actions</h3>
            <div class="action-grid">
              <router-link to="/gift-lunch" class="action-card">
                <div class="action-icon gift">🎁</div>
                <div class="action-content">
                  <h4>Gift Your Lunch</h4>
                  <p>Share your meal with a friend</p>
                </div>
                <div class="action-arrow">→</div>
              </router-link>

              <router-link to="/public-pool" class="action-card">
                <div class="action-icon pool">🔄</div>
                <div class="action-content">
                  <h4>Public Lunch Pool</h4>
                  <p>Explore available lunches</p>
                </div>
                <div class="action-arrow">→</div>
              </router-link>
            </div>
          </div>
        </div>

        <div class="dashboard-footer">
          <button @click="logout" class="logout-btn">
            <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.dashboard-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  min-height: calc(100vh - 160px);
  background: transparent;
  position: relative;
}

.dashboard-container {
  width: 100%;
  max-width: 600px;
  position: relative;
}

.dashboard-card {
  background: rgba(255,255,255,0.85); /* semi-transparent for light theme */
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  transition: all var(--transition-normal);
}
[data-theme="dark"] .dashboard-card {
  background: rgba(32,32,32,0.85); /* semi-transparent for dark theme */
}

.dashboard-card:hover {
  box-shadow: var(--shadow-brand);
}

.dashboard-header {
  padding: var(--space-2xl);
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
  border-bottom: 1px solid var(--border-primary);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  border: 3px solid var(--border-primary);
  object-fit: cover;
  transition: all var(--transition-fast);
}

.profile-avatar:hover {
  transform: scale(1.05);
  border-color: var(--brand-primary);
}

.user-info {
  flex: 1;
}

.welcome-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin: 0 0 var(--space-xs) 0;
}

.user-name {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--brand-primary);
  margin: 0 0 var(--space-xs) 0;
  letter-spacing: -0.02em;
}

.current-date {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.dashboard-content {
  padding: var(--space-2xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
}

.lunch-status-card {
  background: rgba(248,247,242,0.85); /* semi-transparent for light theme */
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  transition: all var(--transition-fast);
}
[data-theme="dark"] .lunch-status-card {
  background: rgba(36,36,36,0.85);
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.status-header h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--error-bg);
  color: var(--error-text);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.status-indicator.has-lunch {
  background: var(--success-bg);
  color: var(--success-text);
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.lunch-info {
  padding: var(--space-lg);
  background: rgba(255,255,255,0.85);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
}
[data-theme="dark"] .lunch-info {
  background: rgba(32,32,32,0.85);
}

.lunch-success,
.lunch-empty {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.lunch-icon,
.empty-icon {
  font-size: 3rem;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--success-bg);
  border-radius: var(--radius-full);
  border: 2px solid var(--success-border);
}

.empty-icon {
  background: var(--error-bg);
  border-color: var(--error-border);
  filter: grayscale(1);
}

.lunch-details h4,
.empty-details h4 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-xs) 0;
}

.lunch-details p,
.empty-details p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0 0 var(--space-md) 0;
}

.lunch-number {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.order-badge {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--brand-primary);
  background: var(--bg-card);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
}

.actions-section {
  margin-top: var(--space-lg);
}

.actions-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-lg) 0;
}

.action-grid {
  display: grid;
  gap: var(--space-md);
}

.action-card {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--bg-overlay), transparent);
  transition: left var(--transition-slow);
}

.action-card:hover::before {
  left: 100%;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--brand-primary);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  transition: all var(--transition-fast);
}

.action-icon.gift {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.action-icon.pool {
  background: linear-gradient(135deg, var(--brand-accent), #2563eb);
}

.action-card:hover .action-icon {
  transform: scale(1.1);
}

.action-content {
  flex: 1;
}

.action-content h4 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-xs) 0;
}

.action-content p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.action-arrow {
  font-size: var(--font-size-xl);
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}

.action-card:hover .action-arrow {
  color: var(--brand-primary);
  transform: translateX(4px);
}

.dashboard-footer {
  padding: var(--space-xl) var(--space-2xl);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
  text-align: center;
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.logout-btn:hover {
  background: var(--error-bg);
  color: var(--error-text);
  border-color: var(--error-border);
  transform: translateY(-1px);
}

.logout-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* Responsive */
@media (max-width: 640px) {
  .dashboard-main {
    padding: var(--space-md);
  }

  .dashboard-header,
  .dashboard-content,
  .dashboard-footer {
    padding: var(--space-lg);
  }

  .user-profile {
    flex-direction: column;
    text-align: center;
    gap: var(--space-md);
  }

  .profile-avatar {
    width: 64px;
    height: 64px;
  }

  .user-name {
    font-size: var(--font-size-2xl);
  }

  .lunch-success,
  .lunch-empty {
    flex-direction: column;
    text-align: center;
    gap: var(--space-md);
  }

  .lunch-icon,
  .empty-icon {
    width: 64px;
    height: 64px;
    font-size: 2.5rem;
  }

  .action-card {
    padding: var(--space-md);
    gap: var(--space-md);
  }

  .action-icon {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-lg);
  }
}
</style>
