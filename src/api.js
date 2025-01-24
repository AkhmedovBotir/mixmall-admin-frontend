import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Auth API
export const login = (data) => axios.post(`${API_URL}/auth/login`, data);
export const register = (data) => axios.post(`${API_URL}/auth/register`, data);
export const verifyCode = (data) => axios.post(`${API_URL}/auth/verify`, data);
export const getMe = () => axios.get(`${API_URL}/auth/me`);

// Products API
export const getProducts = (params) => axios.get(`${API_URL}/products`, { params });
export const getProduct = (id) => axios.get(`${API_URL}/products/${id}`);

// Categories API
export const getCategories = () => axios.get(`${API_URL}/categories`);
export const getCategory = (id) => axios.get(`${API_URL}/categories/${id}`);

// Brands API
export const getBrands = () => axios.get(`${API_URL}/brands`);
export const getBrand = (id) => axios.get(`${API_URL}/brands/${id}`);

// Cart API
export const getCart = () => axios.get(`${API_URL}/cart`);
export const addToCart = (data) => axios.post(`${API_URL}/cart/add`, data);
export const updateCartItem = (itemId, data) => axios.put(`${API_URL}/cart/item/${itemId}`, data);
export const removeCartItem = (itemId) => axios.delete(`${API_URL}/cart/item/${itemId}`);

// Orders API
export const getOrders = () => axios.get(`${API_URL}/orders`);
export const createOrder = (data) => axios.post(`${API_URL}/orders`, data);
export const getOrder = (id) => axios.get(`${API_URL}/orders/${id}`);

// Profile API
export const updateProfile = (data) => axios.put(`${API_URL}/profile`, data);
export const changePassword = (data) => axios.put(`${API_URL}/profile/password`, data);

// Configure axios
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);
