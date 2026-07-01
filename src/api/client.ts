import axios from 'axios';

// Configure the base URL for the new PHP backend
// In local development, it might be http://localhost:8000/api
// In production, it will be the real domain
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add the JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle 401 Unauthorized errors (token expired)
apiClient.interceptors.response.use((response) => {
  // If the server returns HTML instead of JSON (common in Vercel SPA fallbacks), reject so the fallback catch block runs
  if (typeof response.data === 'string' && response.data.toLowerCase().includes('<html')) {
    return Promise.reject(new Error('API returned HTML instead of JSON'));
  }
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // Clear token and redirect to login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default apiClient;
