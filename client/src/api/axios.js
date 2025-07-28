import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Required to send cookies
});

// Cache CSRF token in memory
let csrfTokenCache = null;

api.interceptors.request.use(async (config) => {
  // Skip if CSRF token is already set
  if (!csrfTokenCache) {
    const { data } = await axios.get('http://localhost:5000/api/csrf-token', {
      withCredentials: true,
    });
    csrfTokenCache = data.csrfToken;
  }

  config.headers['X-CSRF-Token'] = csrfTokenCache;
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
