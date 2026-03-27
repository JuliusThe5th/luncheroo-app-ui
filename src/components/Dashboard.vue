<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <img src="../assets/images/logo-no-background.png" alt="Logo" class="header-logo" />
      <div class="user-info">
        <span class="welcome-message">Hello, {{ userName }}</span>
        <button class="logout-btn" @click="logout">Logout</button>
      </div>
    </header>

    <main class="dashboard-content">
      <div class="lunch-status">
        <h2 class="lunch-heading">Your lunch today:</h2>
        <div v-if="hasLunchToday" class="lunch-info">
          {{ lunchCount }}
        </div>
        <div v-else class="no-lunch-info">
          You don't have lunch for today
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userName = ref(localStorage.getItem('user_name') || 'User');
const hasLunchToday = ref(false);
const lunchCount = ref(0);

onMounted(async () => {
  try {
    console.log('Dashboard mounted, checking authentication...');
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');

    console.log('Auth token exists:', !!token);

    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/');
      return;
    }

    // Since we already have the user's name from Google OAuth stored in localStorage,
    // we can display it immediately while we wait for the API call
    userName.value = localStorage.getItem('user_name') || 'User';

    try {
      // Get user info with token authentication
      console.log('Fetching user info...');

      const userResponse = await fetch(`/api/user-info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('User info response status:', userResponse.status);

      if (userResponse.ok) {
        try {
          const userData = await userResponse.json();
          console.log('User data received:', userData);

          if (userData && userData.name) {
            userName.value = userData.name;
          }

          // Get lunch information
          await getLunchInfo(token);
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
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_name');
      router.push('/');
    }
  }
});

async function getLunchInfo(token) {
  try {
    // Get lunch information using token authentication
    const response = await fetch(`/api/lunch/today`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lunch info response error:', errorText);
      throw new Error('Failed to fetch lunch information');
    }

    // Try to parse the response as JSON
    let lunchData;
    try {
      const responseText = await response.text();
      console.log('Raw lunch info response:', responseText);
      lunchData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('Error parsing lunch info response:', e);
      throw new Error('Invalid lunch data from server');
    }

    if (lunchData.hasLunch) {
      hasLunchToday.value = true;
      lunchCount.value = lunchData.count || 1;
    } else {
      hasLunchToday.value = false;
    }
  } catch (error) {
    console.error('Error fetching lunch data:', error);
    // Keep the mock data if there's an error
  }
}

function logout() {
  // No need to call logout endpoint since we're not using cookies
  // Just clear the local storage and redirect to login
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_name');
  router.push('/');
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--color-background-soft);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-logo {
  height: 40px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-message {
  font-weight: 600;
  font-size: 1.1rem;
}

.logout-btn {
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dashboard-content {
  flex: 1;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.lunch-status {
  background-color: var(--color-background-soft);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 300px;
}

.lunch-heading {
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  color: var(--color-heading);
}

.lunch-info {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-heading);
}

.no-lunch-info {
  font-size: 1.2rem;
  color: #888;
  font-style: italic;
}
</style>
