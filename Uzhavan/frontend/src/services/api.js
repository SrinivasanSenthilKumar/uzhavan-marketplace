import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // token invalid/expired - clear session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

export const resolveUploadUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000';
  return `${base}${path}`;
};

export default api;
