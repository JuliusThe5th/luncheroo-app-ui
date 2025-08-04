// Google authentication utilities
import { api } from './api.js';

export class GoogleAuth {
  constructor(clientId) {
    this.clientId = clientId;
    this.isLoaded = false;
  }

  // Load Google authentication script
  async loadScript() {
    if (this.isLoaded || document.getElementById('google-signin-script')) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'google-signin-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };

      script.onerror = (error) => {
        reject(new Error('Failed to load Google authentication script'));
      };

      document.head.appendChild(script);
    });
  }

  // Initialize OAuth client and handle sign-in
  async signIn() {
    if (!window.google?.accounts) {
      throw new Error('Google API not available');
    }

    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'email profile',
        callback: async (tokenResponse) => {
          try {
            if (tokenResponse.error) {
              throw new Error(tokenResponse.error);
            }

            // Get user info from Google
            const userInfo = await this.getUserInfo(tokenResponse.access_token);

            // Verify with backend
            const authData = await api.verifyToken({
              fullName: userInfo.name,
              sub: userInfo.sub,
              picture: userInfo.picture
            });

            resolve({
              userInfo,
              authData
            });
          } catch (error) {
            reject(error);
          }
        }
      });

      client.requestAccessToken();
    });
  }

  // Get user info from Google API
  async getUserInfo(accessToken) {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user info from Google');
    }

    return response.json();
  }
}

// Export a singleton instance
export const googleAuth = new GoogleAuth(import.meta.env.VITE_GOOGLE_CLIENT_ID);
