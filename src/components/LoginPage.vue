<template>
  <div class="login-container">
    <div class="login-content">
      <img src="../assets/images/logo-no-background.png" alt="Logo" class="logo" />
      <h1 class="welcome-heading">Welcome to Luncheroo</h1>
      <p class="welcome-text">Your lunch management solution</p>

      <!-- Custom Google Sign-In button instead of the auto-rendered one -->
      <button class="google-signin-button" @click="signInWithGoogle">
        <img src="../assets/images/web_light_rd_SI@1x.png" alt="Sign in with Google" />
      </button>

      <p v-if="loginError" class="login-error">{{ loginError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import { setJWTToken, socketAPI } from '../utils/socket.js';

const router = useRouter();
const { setAuth } = useAuth();
const loginError = ref('');
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

onMounted(() => {
  // Check if user is already authenticated
  const isAuthenticated = localStorage.getItem('is_authenticated');
  if (isAuthenticated) {
    checkAuthentication();
  }

  // Load Google Sign-In API script
  loadGoogleScript();
});

function loadGoogleScript() {
  if (document.getElementById('google-signin-script')) return;

  const script = document.createElement('script');
  script.id = 'google-signin-script';
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function signInWithGoogle() {
  if (!window.google || !window.google.accounts) {
    console.error('Google API not loaded yet');
    loginError.value = 'Google Sign-In is not available right now. Please try again.';
    return;
  }

  // Use the less problematic auth flow
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: googleClientId,
    scope: 'email profile',
    callback: handleOAuthResponse
  });

  // Request an access token
  client.requestAccessToken();
}

async function handleOAuthResponse(tokenResponse) {
  if (tokenResponse.error) {
    console.error('OAuth error:', tokenResponse.error);
    loginError.value = 'Authentication failed. Please try again.';
    return;
  }

  try {
    // Send the actual Google access token to the backend so it can verify
    // identity with Google directly — never trust client-supplied user data.
    const verificationResponse = await fetch('/api/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ googleToken: tokenResponse.access_token })
    });

    if (!verificationResponse.ok) {
      const errorText = await verificationResponse.text();
      throw new Error(`Token verification failed: ${verificationResponse.status} ${verificationResponse.statusText} — ${errorText}`);
    }

    const authData = await verificationResponse.json();

    if (!authData.token) {
      throw new Error('No token received from server');
    }

    // Persist the signed token and wire up in-app auth state.
    // is_admin comes from the server and is kept in memory only (not localStorage).
    localStorage.setItem('auth_token', authData.token);
    setJWTToken(authData.token);
    socketAPI.connect(authData.token);

    setAuth({
      name: authData.name,
      email: authData.email,
      picture: authData.picture,
      isAdmin: authData.is_admin  // server-verified; never written to localStorage
    });

    router.push(authData.is_admin ? '/admin' : '/dashboard');
  } catch (error) {
    console.error('Authentication error:', error);
    loginError.value = `Authentication failed: ${error.message}`;
  }
}

async function checkAuthentication() {
  try {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      // No token found
      return;
    }

    // Verify the token with the backend
    const response = await fetch(`/api/user-info`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      // Token is valid, redirect to dashboard
      router.push('/dashboard');
    } else {
      // Token is invalid, remove it
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_name');
    }
  } catch (error) {
    console.error('Authentication check error:', error);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: 0;
}

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 500px;
  text-align: center;
  width: 100%;
  margin: 0 auto;
}

.logo {
  width: 220px;
  margin-bottom: 30px;
}

.welcome-heading {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 8px;
}

.welcome-text {
  font-size: 18px;
  color: var(--color-text);
  margin-bottom: 40px;
  font-weight: 300;
}

.google-signin-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s ease;
}

.google-signin-button:hover {
  transform: scale(1.05);
}

.google-signin-button img {
  width: 250px;
}

.login-error {
  margin-top: 20px;
  color: #e74c3c;
  font-size: 14px;
}
</style>
