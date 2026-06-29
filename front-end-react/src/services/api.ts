import axios from 'axios';

// Instância para comunicar com o Auth Service (Porta 8000)
export const authApi = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Instância para comunicar com o Product Service (Porta 8001)
export const productApi = axios.create({
  baseURL: 'http://localhost:8001/api',
});

// Injeta o token JWT automaticamente em todas as requisições de produtos
productApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
