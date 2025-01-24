import api from './axios';

// Dashboard umumiy ma'lumotlarini olish
export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

// So'nggi buyurtmalarni olish
export const getRecentOrders = async (limit = 10) => {
  const response = await api.get(`/dashboard/recent-orders?limit=${limit}`);
  return response.data;
};

// Buyurtmalar statistikasini olish
export const getOrdersStats = async (days = 7) => {
  const response = await api.get(`/dashboard/orders-stats?days=${days}`);
  return response.data;
};
