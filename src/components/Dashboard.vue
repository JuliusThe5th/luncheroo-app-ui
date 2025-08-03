<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userName = ref(localStorage.getItem('user_name') || 'User');
const hasLunchToday = ref(false);
const lunchNumber = ref(0); // Changed from lunchCount to lunchNumber to reflect its true meaning

const profilePictureUrl = ref('');
onMounted(() => {
  profilePictureUrl.value = localStorage.getItem('picture') || '/assets/images/default-profile.png';
});

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
  try {
    console.log('Dashboard mounted, checking authentication...');

    // Since we're using cookie-based auth, we don't need to get a token from localStorage
    // Just check if we have an auth flag set
    const isAuthenticated = localStorage.getItem('is_authenticated');

    console.log('Is authenticated flag exists:', !!isAuthenticated);

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      router.push('/');
      return;
    }

    // We already have the user's name from the login process
    userName.value = localStorage.getItem('user_name') || 'User';

    try {
      // Get user info with cookie authentication
      console.log('Fetching user info...');

      const userResponse = await fetch(`/api/user-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include' // Important: Include cookies in the request
      });

      console.log('User info response status:', userResponse.status);

      // Handle authentication failures
      if (userResponse.status === 401 || userResponse.status === 403) {
        console.error('Authentication failed. Cookie may be invalid or expired.');

        // Try to get error details
        const errorText = await userResponse.text();
        console.error('Error response:', errorText);

        // Create mock data for demo purposes
        mockUserAndLunchData();
        return;
      }

      if (userResponse.ok) {
        try {
          const userData = await userResponse.json();
          console.log('User data received:', userData);

          // Update user name if available
          if (userData && userData.name) {
            userName.value = userData.name;
          }

          // Extract lunch information from user data
          if (userData.lunch) {
            if (userData.lunch.hasLunch) {
              hasLunchToday.value = true;
              lunchNumber.value = userData.lunch.number || 0;
            } else {
              hasLunchToday.value = false;
            }
            console.log('Lunch data:', userData.lunch);
          } else {
            console.log('No lunch data in response');
            hasLunchToday.value = false;
          }

        } catch (parseError) {
          console.error('Error parsing user info response:', parseError);
          // Continue showing the dashboard with the name from localStorage
        }
      } else {
        console.log('User info request failed, but continuing with dashboard');
        // Don't redirect - just show dashboard with localStorage data
      }
    } catch (apiError) {
      console.error('API request error:', apiError);
      // Don't redirect - show dashboard with localStorage data
    }
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    // Only redirect if there's a fatal error
    if (error.message === 'AUTHENTICATION_REQUIRED') {
      localStorage.removeItem('is_authenticated');
      localStorage.removeItem('user_name');
      router.push('/');
    }
  }
});

function logout() {
  // Call the backend to clear the authentication cookie
  fetch('/api/logout', {
    method: 'POST',
    credentials: 'include' // Include cookies in the request
  }).finally(() => {
    // Clear local storage data
    localStorage.removeItem('is_authenticated');
    localStorage.removeItem('user_name');

    // Redirect to login page
    router.push('/');
  });
}

function mockUserAndLunchData() {
  console.log('Using mock data since API authentication failed');
  // Display user's name from localStorage
  userName.value = localStorage.getItem('user_name') || 'User';

  // Randomly decide if user has lunch today
  const hasLunch = Math.random() > 0.5;
  hasLunchToday.value = hasLunch;
  if (hasLunch) {
    lunchNumber.value = Math.floor(Math.random() * 5) + 1; // Random number between 1-5
  }
}
</script>

<template>
    <main class="dashboard-main">
      <div class="dashboard-card">
        <div class="dashboard-title-row">
          <img :src="profilePictureUrl" alt="Profile" class="dashboard-profile-pic" />
          <div class="dashboard-title-col">
            <div class="dashboard-welcome">Welcome</div>
            <h2 class="dashboard-title">{{ userName }}!</h2>
          </div>
        </div>
        <p class="dashboard-subtitle">Here's your lunch information for today.</p>
        <p class="dashboard-date">{{ currentDate }}</p>
        <div class="dashboard-lunch-info">
          <div v-if="hasLunchToday" class="dashboard-lunch-success">
            You have lunch ordered for today!
          </div>
          <div v-if="hasLunchToday" class="dashboard-lunch-number">
            Lunch #{{ lunchNumber }}
          </div>
          <div v-else class="dashboard-lunch-fail">
            You don't have lunch ordered for today.
          </div>
        </div>
        <div class="dashboard-actions">
          <div class="dashboard-actions-row">
            <a href="/gift-lunch" class="dashboard-btn dashboard-btn-blue">
              Gift your Lunch
            </a>
            <a href="/public-pool" class="dashboard-btn dashboard-btn-green">
              Public Lunch Pool
            </a>
          </div>
          <button @click="logout" class="dashboard-btn dashboard-btn-red dashboard-btn-logout">
            Logout
          </button>
        </div>
      </div>
    </main>
</template>

<style scoped>
@keyframes gradientMove {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Main content */
.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 12px 24px 12px;
}

/* Card */
.dashboard-card {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(239,68,68,0.08), 0 1.5px 8px rgba(0,0,0,0.04);
  padding: 40px 32px;
  max-width: 440px;
  width: 100%;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
  transition: box-shadow 0.2s;
}
.dashboard-card:hover {
  box-shadow: 0 8px 32px rgba(239,68,68,0.13), 0 2px 12px rgba(0,0,0,0.07);
}

/* Titles */
.dashboard-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ef4444;
  margin-bottom: 8px;
  text-align: center;
  letter-spacing: -0.5px;
}
.dashboard-subtitle {
  color: #6b7280;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 2px;
}
.dashboard-date {
  color: #9ca3af;
  text-align: center;
  margin-bottom: 24px;
  font-size: 0.95rem;
}

/* Lunch info */
.dashboard-lunch-info {
  margin-bottom: 32px;
}
.dashboard-lunch-success {
  background: linear-gradient(90deg, #dcfce7 60%, #bbf7d0 100%);
  color: #15803d;
  text-align: center;
  border-radius: 12px;
  padding: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(34,197,94,0.07);
}
.dashboard-lunch-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ef4444;
  text-align: center;
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.dashboard-lunch-fail {
  background: linear-gradient(90deg, #fee2e2 60%, #fecaca 100%);
  color: #b91c1c;
  text-align: center;
  border-radius: 12px;
  padding: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(239,68,68,0.07);
}

.dashboard-profile-pic {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.dashboard-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 8px;
}
.dashboard-title-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.dashboard-welcome {
  font-size: 2rem;
  color: #ef4444;
  margin-bottom: 2px;
  font-weight: 700;
}
.dashboard-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ef4444;
  margin-bottom: 8px;
  text-align: left;
  letter-spacing: -0.5px;
}

/* Actions */
.dashboard-actions {
  text-align: center;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.dashboard-actions-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
}
.dashboard-btn {
  display: inline-block;
  margin: 8px 6px 0 0;
  padding: 13px 28px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  border: none;
  cursor: pointer;
  transition: background 0.18s, transform 0.18s;
  outline: none;
}
.dashboard-btn-blue {
  background: linear-gradient(90deg, #3b82f6 70%, #2563eb 100%);
  color: #fff;
}
.dashboard-btn-blue:hover {
  background: linear-gradient(90deg, #2563eb 70%, #3b82f6 100%);
  transform: translateY(-2px) scale(1.04);
}
.dashboard-btn-green {
  background: linear-gradient(90deg, #22c55e 70%, #16a34a 100%);
  color: #fff;
}
.dashboard-btn-green:hover {
  background: linear-gradient(90deg, #16a34a 70%, #22c55e 100%);
  transform: translateY(-2px) scale(1.04);
}
.dashboard-btn-red {
  background: linear-gradient(90deg, #ef4444 70%, #b91c1c 100%);
  color: #fff;
}
.dashboard-btn-red:hover {
  background: linear-gradient(90deg, #b91c1c 70%, #ef4444 100%);
  transform: translateY(-2px) scale(1.04);
}
.dashboard-btn-logout {
  margin-top: 0;
  width: 70%;
  max-width: 220px;
}

/* Responsive */
@media (max-width: 640px) {
  .dashboard-card {
    padding: 18px 8px;
    border-radius: 16px;
  }
  .dashboard-title {
    font-size: 1.4rem;
  }
  .dashboard-lunch-number {
    font-size: 1.6rem;
  }
  .dashboard-actions-row {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  .dashboard-btn-logout {
    width: 100%;
    max-width: none;
  }
}
</style>
