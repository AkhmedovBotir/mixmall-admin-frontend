import axios from 'axios';

const api = axios.create({
  baseURL: 'https://adderapi.mixmall.uz/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('=== REQUEST INFO ===');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('Token:', token);
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    console.log('===================');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor - Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response interceptor - Success:', response);
    return response.data;
  },
  (error) => {
    console.error('Response interceptor - Error:', error);
    return Promise.reject(error);
  }
);

export default api;
