<template>
  <main class="dashboard-main">
    <div class="dashboard-container">
      <!-- Main Card -->
      <div class="dashboard-card fade-in">
        <!-- Header -->
        <div class="dashboard-header">
          <div class="header-top">
            <h1 class="welcome-text">Admin Dashboard</h1>
            <button @click="logout" class="logout-btn">
              <i class="bi bi-box-arrow-right"></i>
              Sign Out
            </button>
          </div>
          <p class="current-date">{{ currentTime }}</p>
        </div>

        <!-- Content -->
        <div class="dashboard-content">
          <!-- Overview Stats -->
          <section class="overview-grid">
            <div class="stat-card red">
              <div class="stat-icon"><i class="fas fa-utensils"></i></div>
              <div>
                <h3>Lunch Orders</h3>
                <p class="stat-value">{{ lunchCount }}</p>
              </div>
            </div>

            <div class="stat-card green">
              <div class="stat-icon"><i class="fas fa-hamburger"></i></div>
              <div>
                <h3>Available</h3>
                <p class="stat-value">{{ availableCount }}</p>
              </div>
            </div>

            <div class="stat-card blue">
              <div class="stat-icon"><i class="fas fa-users"></i></div>
              <div>
                <h3>Activity</h3>
                <p class="stat-value">{{ recentActivityCount }}</p>
              </div>
            </div>
          </section>

          <!-- Tools -->
          <section>
            <h2 class="section-title">Administrative Tools</h2>
            <div class="action-grid">
              <router-link to="/card-scanner" class="action-card">
                <div class="action-icon red"><i class="fas fa-id-card"></i></div>
                <div class="action-content">
                  <h4>Card Scanner</h4>
                  <p>Scan student cards & view history</p>
                </div>
                <div class="action-arrow">→</div>
              </router-link>

              <router-link to="/assign-card" class="action-card">
                <div class="action-icon blue"><i class="fas fa-user-edit"></i></div>
                <div class="action-content">
                  <h4>Card Assignment</h4>
                  <p>Assign NFC cards to students</p>
                </div>
                <div class="action-arrow">→</div>
              </router-link>
            </div>
          </section>

          <!-- Analytics -->
          <section>
            <h2 class="section-title">Analytics</h2>
            <div class="analytics-grid">
              <!-- Student Status -->
              <div class="panel">
                <h3 class="panel-title">Student Lunch Status</h3>
                <div class="status-stats">
                  <div>
                    <p class="stat-value red">{{ totalStudents }}</p>
                    <p>Total</p>
                  </div>
                  <div>
                    <p class="stat-value green">{{ studentsWithLunch }}</p>
                    <p>With Lunch</p>
                  </div>
                  <div>
                    <p class="stat-value yellow">{{ studentsWithoutLunch }}</p>
                    <p>Without</p>
                  </div>
                </div>
              </div>

              <!-- Recent Assignments -->
              <div class="panel">
                <h3 class="panel-title">Recent Assignments</h3>
                <ul v-if="recentAssignments.length" class="recent-list">
                  <li v-for="a in recentAssignments" :key="a.lunch_id">
                    <span>{{ a.student_name }}</span>
                    <span class="badge">#{{ a.lunch_id }}</span>
                  </li>
                </ul>
                <p v-else class="empty">No recent assignments</p>
              </div>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <div class="dashboard-footer">
          <p>&copy; 2025 Luncheroo Admin</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuth } from "../composables/useAuth.js";

const { logout } = useAuth();
const currentTime = ref("");

const lunchCount = ref(12);
const availableCount = ref(8);
const recentActivityCount = ref(34);
const totalStudents = ref(250);
const studentsWithLunch = ref(200);
const studentsWithoutLunch = ref(50);
const recentAssignments = ref([
  { lunch_id: 101, student_name: "Alice" },
  { lunch_id: 102, student_name: "Bob" },
  { lunch_id: 103, student_name: "Charlie" }
]);

function updateTime() {
  const now = new Date();
  currentTime.value = now.toLocaleString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

onMounted(() => {
  updateTime();
  setInterval(updateTime, 1000);
});
</script>

<style scoped>
.dashboard-main {
  display: flex;
  justify-content: center;
  padding: var(--space-xl);
  background: linear-gradient(135deg, #fdfdfd, #f5f5f5);
  min-height: 100vh;
}

.dashboard-container {
  width: 100%;
  max-width: 1100px;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: fadeIn 0.6s ease;
}

.dashboard-header {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: white;
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.welcome-text {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}
.current-date {
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.dashboard-content {
  padding: var(--space-2xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
}

/* Stats cards */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-lg);
}
.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-xl);
  border-radius: var(--radius-xl);
  color: white;
  font-weight: var(--font-weight-semibold);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.stat-icon {
  font-size: 2rem;
}
.stat-card.red { background: linear-gradient(135deg, #f87171, #ef4444); }
.stat-card.green { background: linear-gradient(135deg, #4ade80, #16a34a); }
.stat-card.blue { background: linear-gradient(135deg, #60a5fa, #2563eb); }
.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
}

/* Action cards */
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
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
.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--brand-primary);
}
.action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: white;
  font-size: 1.25rem;
}
.action-icon.red { background: linear-gradient(135deg, #f87171, #ef4444); }
.action-icon.blue { background: linear-gradient(135deg, #60a5fa, #2563eb); }
.action-arrow { font-size: 1.25rem; opacity: 0.5; }

/* Panels */
.analytics-grid {
  display: grid;
  gap: var(--space-lg);
  grid-template-columns: 1fr 1fr;
}
.panel {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow);
}
.panel-title {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-lg);
}
.status-stats {
  display: flex;
  justify-content: space-around;
}
.status-stats div {
  text-align: center;
}
.stat-value.red { color: #ef4444; }
.stat-value.green { color: #16a34a; }
.stat-value.yellow { color: #eab308; }

.recent-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.recent-list li {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm);
  border-bottom: 1px solid var(--border-secondary);
}
.badge {
  background: var(--bg-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}
.empty {
  text-align: center;
  color: var(--text-tertiary);
}

/* Footer */
.dashboard-footer {
  background: var(--bg-secondary);
  padding: var(--space-md);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.logout-btn {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  color: white;
  font-weight: 500;
  transition: all 0.2s;
}
.logout-btn:hover {
  background: rgba(255,255,255,0.3);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
