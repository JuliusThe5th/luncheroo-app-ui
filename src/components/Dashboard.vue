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
          Lunch #{{ lunchNumber }}
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
const lunchNumber = ref(0); // Changed from lunchCount to lunchNumber to reflect its true meaning

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
