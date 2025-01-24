import axios from 'axios';

const BASE_URL = 'https://adderapi.mixmall.uz'  // Production API URL

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data; // Faqat data ni qaytaramiz
  },
  (error) => {
    if (error.response) {
      // Server xatoligi
      console.error('Server xatoligi:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // So'rov xatoligi
      console.error('So\'rov xatoligi:', error.request);
      return Promise.reject(new Error('Server bilan bog\'lanishda xatolik'));
    } else {
      // Boshqa xatolik
      console.error('Xatolik:', error.message);
      return Promise.reject(error);
    }
  }
);

export default api;
