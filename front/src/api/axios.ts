import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

api.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('token');

  if (config?.headers && accessToken)
    config.headers.Authorization = `Bearer ${accessToken}`

  return config
})

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Перенаправляем на страницу входа при ошибке авторизации
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;