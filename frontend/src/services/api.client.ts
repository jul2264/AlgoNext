import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
if (baseURL.endsWith('/')) {
  baseURL = baseURL.slice(0, -1);
}

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// We need a way to inject the Clerk token dynamically.
// Since we can't easily use the useAuth hook inside a non-component file,
// we will export a setup function that takes the getToken function from Clerk.

let clerkGetToken: (() => Promise<string | null>) | null = null;

export const setupApiClient = (getToken: () => Promise<string | null>) => {
  clerkGetToken = getToken;
};

apiClient.interceptors.request.use(
  async (config) => {
    if (clerkGetToken) {
      try {
        const token = await clerkGetToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get Clerk token', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
