<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
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

function logAuth(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] AUTH: ${message}`);
  if (data) {
    console.log('→ Data:', data);
  }
}

// Update loadGoogleScript function to include logging
function loadGoogleScript() {
  logAuth('Loading Google authentication script');

  if (document.getElementById('google-signin-script')) {
    logAuth('Google script already loaded, skipping');
    return;
  }

  const script = document.createElement('script');
  script.id = 'google-signin-script';
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    logAuth('Google authentication script loaded successfully');
  };
  script.onerror = (error) => {
    logAuth('Failed to load Google authentication script', error);
    loginError.value = 'Failed to load authentication services';
  };
  document.head.appendChild(script);
}

function signInWithGoogle() {
  logAuth('Google Sign-In button clicked');

  if (!window.google || !window.google.accounts) {
    logAuth('Google API not available yet');
    loginError.value = 'Google Sign-In is not available right now. Please try again.';
    return;
  }

  logAuth('Initializing Google OAuth token client');
  // Use the less problematic auth flow
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: googleClientId,
    scope: 'email profile',
    callback: handleOAuthResponse
  });

  // Request an access token
  logAuth('Requesting OAuth token from Google');
  client.requestAccessToken();
}

// Update handleOAuthResponse function to include logging
async function handleOAuthResponse(tokenResponse) {
  if (tokenResponse.error) {
    logAuth('OAuth error received', tokenResponse.error);
    loginError.value = 'Authentication failed. Please try again.';
    return;
  }

  logAuth('OAuth token received successfully');

  try {
    // Exchange the token for user info
    logAuth('Fetching user profile from Google');
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenResponse.access_token}`
      }
    });

    if (!userInfoResponse.ok) {
      const error = await userInfoResponse.text();
      logAuth('Failed to get user info from Google', { status: userInfoResponse.status, error });
      throw new Error('Failed to get user info');
    }

    const userInfo = await userInfoResponse.json();
    logAuth('User profile retrieved from Google', {
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      picture: userInfo.picture,
      sub: userInfo.sub
    });

    // Send user info to your backend
    logAuth('Sending authentication data to backend');
    const verificationResponse = await fetch(`/api/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: userInfo.name,
        sub: userInfo.sub,
        picture: userInfo.picture
      }),
      credentials: 'include' // Important: This tells fetch to include cookies in the request
    });

    // Check if response is ok before proceeding
    if (!verificationResponse.ok) {
      const errorText = await verificationResponse.text();
      logAuth('Backend token verification failed', {
        status: verificationResponse.status,
        statusText: verificationResponse.statusText,
        error: errorText
      });
      throw new Error(`Token verification failed: ${verificationResponse.status} ${verificationResponse.statusText}`);
    }

    const authData = await verificationResponse.json();
    logAuth('Authentication successful with backend', { message: authData.message });

    // With cookie-based auth, we don't need to store the token
    // Just store the user's name for the UI and a flag that we're authenticated
    localStorage.setItem('is_authenticated', 'true');
    localStorage.setItem('user_name', userInfo.name);
    localStorage.setItem('picture', userInfo.picture);
    logAuth('Authentication data stored in localStorage');

    // Redirect to dashboard
    logAuth('Redirecting to dashboard');
    await router.push('/dashboard');
  } catch (error) {
    logAuth('Authentication error', { message: error.message, stack: error.stack });
    loginError.value = `Authentication failed: ${error.message}`;
  }
}

// Update checkAuthentication function to include logging
async function checkAuthentication() {
  logAuth('Checking existing authentication');

  try {
    // With cookie authentication, we don't need to pass the token in headers
    logAuth('Validating authentication with backend');
    const response = await fetch(`/api/user-info`, {
      credentials: 'include' // Include cookies in the request
    });

    if (response.ok) {
      logAuth('Authentication verified successfully');
      // Authentication is valid, redirect to dashboard
      router.push('/dashboard');
    } else {
      logAuth('Authentication invalid or expired', { status: response.status });
      // Authentication failed, remove auth flag
      localStorage.removeItem('is_authenticated');
      localStorage.removeItem('user_name');
      logAuth('Cleared authentication data from localStorage');
    }
  } catch (error) {
    logAuth('Authentication check error', { message: error.message });
    localStorage.removeItem('is_authenticated');
    localStorage.removeItem('user_name');
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-content">
        <img src="../assets/images/logo-no-background.png" alt="Logo" class="logo" />
        <h1 class="welcome-heading">Welcome to Luncheroo</h1>
        <p class="welcome-text">Your lunch management solution</p>

        <!-- Custom Google Sign-In button instead of the auto-rendered one -->
        <button class="google-signin-button" @click="signInWithGoogle">
          <img src="../assets/images/branding_guideline_sample_nt_rd_lg.svg" alt="Sign in with Google" />
        </button>

        <p v-if="loginError" class="login-error">{{ loginError }}</p>
      </div>
    </div>
  </div>
</template>



<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  height: 70vh;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  padding: 2rem 0;
  overflow-x: hidden;
}

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 440px;
  text-align: center;
  width: calc(100% - 2rem);
  margin: 0 auto;
  padding: 2.5rem;
  background-color: var(--color-background);
  border-radius: var(--radius-medium);
  box-shadow: 0 4px 24px rgba(239,68,68,0.08), 0 1.5px 8px rgba(0,0,0,0.04);
  box-sizing: border-box;
  transition: box-shadow 0.2s;
}

.login-content:hover{
  box-shadow: 0 8px 32px rgba(239,68,68,0.13), 0 2px 12px rgba(0,0,0,0.07);
}

.logo {
  width: 180px;
  margin-bottom: 30px;
}

.welcome-heading {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.welcome-text {
  font-size: 18px;
  color: var(--color-text-light);
  margin-bottom: 40px;
  font-weight: 300;
}

.google-signin-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s ease;
  margin-bottom: 1.5rem;
}

.google-signin-button:hover {
  transform: scale(1.05);
}

.google-signin-button:active {
  transform: scale(0.98);
}

.google-signin-button img {
  width: 220px;
}

.login-error {
  margin-top: 20px;
  color: var(--color-error);
  font-size: 14px;
  padding: 10px 15px;
  background-color: rgba(255, 59, 48, 0.1);
  border-radius: var(--radius-small);
  width: 100%;
}

@media (max-width: 640px) {
  .login-content {
    padding: 1.5rem;
  }

  .logo {
    width: 150px;
  }

  .welcome-heading {
    font-size: 24px;
  }

  .welcome-text {
    font-size: 16px;
  }
}
</style>
