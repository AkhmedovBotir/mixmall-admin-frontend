import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Chip,
  Paper,
  Grid,
  LinearProgress,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../api/axios';

// Komponentlarni import qilish
import OrderViewDialog from '../components/OrderViewDialog';
import OrderCourierDialog from '../components/OrderCourierDialog';
import OrderList from '../components/OrderList';

export default function Orders() {
  // State'lar
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openCourierDialog, setOpenCourierDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // API funksiyalari
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      
      if (response.data.success) {
        setOrders(response.data.data.orders);
      } else {
        console.error('Noto\'g\'ri ma\'lumot formati:', response.data);
        showSnackbar('Ma\'lumotlarni yuklashda xatolik yuz berdi', 'error');
      }
    } catch (error) {
      console.error('Buyurtmalarni yuklashda xatolik:', error);
      showSnackbar(error.response?.data?.message || 'Buyurtmalarni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      
      if (response.data.success) {
        showSnackbar('Buyurtma holati yangilandi', 'success');
        fetchOrders();
      } else {
        showSnackbar('Buyurtma holatini yangilashda xatolik yuz berdi', 'error');
      }
    } catch (error) {
      console.error('Buyurtma holatini yangilashda xatolik:', error);
      showSnackbar(error.response?.data?.message || 'Buyurtma holatini yangilashda xatolik yuz berdi', 'error');
    }
  };

  const assignCourierToOrder = async (orderId, courierId) => {
    try {
      const response = await api.put(`/orders/${orderId}/courier`, { courierId });
      
      if (response.data.success) {
        showSnackbar('Kuryer buyurtmaga biriktirildi', 'success');
        fetchOrders();
      } else {
        showSnackbar('Kuryerni buyurtmaga biriktirishda xatolik yuz berdi', 'error');
      }
    } catch (error) {
      console.error('Kuryerni buyurtmaga biriktirishda xatolik:', error);
      showSnackbar(error.response?.data?.message || 'Kuryerni buyurtmaga biriktirishda xatolik yuz berdi', 'error');
    }
  };

  // Token funksiyalari
  const getTokenData = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token ma\'lumotlarini o\'qishda xatolik:', error);
      return null;
    }
  };

  const checkPermissions = () => {
    const tokenData = getTokenData();
    if (!tokenData) return false;

    return tokenData.can_manage_orders && tokenData.can_manage_couriers;
  };

  // Handler funksiyalar
  const handleOpenViewDialog = (order) => {
    setSelectedOrder(order);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedOrder(null);
  };

  const handleOpenCourierDialog = (orderId) => {
    if (!checkPermissions()) {
      showSnackbar('Buyurtmalarni va kuryerlarni boshqarish uchun huquqlar yetarli emas', 'error');
      return;
    }

    const order = orders.find(o => o._id === orderId);
    if (order) {
      setSelectedOrder(order);
      setOpenCourierDialog(true);
    }
  };

  const handleCloseCourierDialog = () => {
    setOpenCourierDialog(false);
    setSelectedOrder(null);
  };

  const handleAssignCourier = async (orderId, courierId) => {
    if (!checkPermissions()) {
      showSnackbar('Buyurtmalarni va kuryerlarni boshqarish uchun huquqlar yetarli emas', 'error');
      return;
    }

    await assignCourierToOrder(orderId, courierId);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
  };

  // Status funksiyalari
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Kutilmoqda';
      case 'confirmed':
        return 'Tasdiqlangan';
      case 'processing':
        return 'Jarayonda';
      case 'shipped':
        return 'Yetkazilmoqda';
      case 'delivered':
        return 'Yetkazildi';
      case 'cancelled':
        return 'Bekor qilindi';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Yordamchi funksiyalar
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // useEffect hooks
  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Box sx={{ width: '100%', p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: 'white',
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs>
            <Typography variant="h5" sx={{ color: '#1a237e' }}>
              Buyurtmalar
            </Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={fetchOrders}
                startIcon={<RefreshIcon />}
                sx={{
                  backgroundColor: '#1a237e',
                  '&:hover': {
                    backgroundColor: '#0d47a1',
                  },
                }}
              >
                Yangilash
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {loading ? (
          <LinearProgress />
        ) : (
          <OrderList
            orders={orders}
            onViewOrder={handleOpenViewDialog}
            onOpenCourierDialog={handleOpenCourierDialog}
            getStatusText={getStatusText}
            getStatusColor={getStatusColor}
          />
        )}
      </Paper>

      {/* Buyurtma ko'rish modali */}
      <OrderViewDialog
        order={selectedOrder}
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        getStatusText={getStatusText}
        getStatusColor={getStatusColor}
        onUpdateStatus={handleUpdateStatus}
        onOpenCourierDialog={handleOpenCourierDialog}
      />

      {/* Kuryer tayinlash modali */}
      <OrderCourierDialog
        open={openCourierDialog}
        onClose={handleCloseCourierDialog}
        onAssign={handleAssignCourier}
        order={selectedOrder}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
