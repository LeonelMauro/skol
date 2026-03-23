import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('user');

  if (storedUser) {
    const user = JSON.parse(storedUser);

    if (user.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
  }

  return config;
});

export default api;