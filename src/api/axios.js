import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// So'rov yuborishdan oldingi interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('=== SO\'ROV MA\'LUMOTLARI ===');
    console.log('URL:', config.url);
    console.log('Metod:', config.method);
    console.log('Token:', token);
    console.log('Sarlavhalar:', config.headers);
    console.log('Ma\'lumotlar:', config.data);
    console.log('===================');

    // CORS uchun kerakli headerlarni qo'shish
    config.headers['Access-Control-Allow-Credentials'] = true;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('So\'rov xatosi:', error);
    return Promise.reject(error);
  }
);

// Javob qaytgandan keyingi interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error('Server javobi xatosi:', {
        status: error.response.status,
        xabar: error.response.data?.message || error.message,
        url: error.config?.url
      });

      // Xatolarni o'zbek tilida qaytarish
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(new Error('Sessiya muddati tugadi. Iltimos, qaytadan tizimga kiring.'));
        
        case 403:
          return Promise.reject(new Error('Sizda bu amalni bajarish uchun ruxsat yo\'q.'));
        
        case 500:
          return Promise.reject(new Error('Serverda ichki xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.'));
        
        default:
          return Promise.reject(new Error(error.response.data?.message || 'Noma\'lum xatolik yuz berdi'));
      }
    }

    if (error.message === 'Network Error') {
      return Promise.reject(new Error('Server bilan aloqa o\'rnatilmadi. Internet aloqangizni tekshiring.'));
    }

    return Promise.reject(error);
  }
);

export default api;
