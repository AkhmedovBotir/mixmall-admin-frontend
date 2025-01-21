import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  Snackbar,
} from '@mui/material';
import {
  Visibility as ViewIcon,
} from '@mui/icons-material';
import axios from 'axios';
import OrderViewDialog from '../components/OrderViewDialog';
import OrderCourierDialog from '../components/OrderCourierDialog';
import { format } from 'date-fns';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [courierDialogOpen, setCourierDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Snackbar yopish
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Buyurtmalarni yuklash
  const fetchOrders = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://adderapi.mixmall.uz/api/orders?page=${pageNum}&limit=10`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.status === 'success') {
        setOrders(response.data.data.orders);
        setTotalPages(response.data.data.pagination.pages);
      } else {
        throw new Error(response.data.message || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  // Buyurtma holatini yangilash
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `https://adderapi.mixmall.uz/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Modal oynani yopish
      setViewDialogOpen(false);
      
      // Muvaffaqiyatli xabar
      setSnackbar({
        open: true,
        message: response.data.message || 'Buyurtma statusi yangilandi',
        severity: 'success'
      });
      
      // Buyurtmalar ro'yxatini yangilash
      fetchOrders(page);

    } catch (error) {
      console.error('Error updating order status:', error);
      // Xatolik xabari
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Buyurtma holatini yangilashda xatolik yuz berdi',
        severity: 'error'
      });
    }
  };

  // Buyurtmaga kuryer tayinlash
  const handleAssignCourier = async (orderId, courier) => {
    try {
      const response = await axios.put(
        `https://adderapi.mixmall.uz/api/orders/${orderId}/courier`,
        { courierId: courier._id },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Muvaffaqiyatli bo'lsa
      fetchOrders(page);
      setViewDialogOpen(false);
      
    } catch (error) {
      console.error('Error assigning courier:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Kuryer tayinlashda xatolik yuz berdi');
      }
    }
  };

  // Kuryer tayinlash dialogini ochish
  const handleOpenCourierDialog = (order) => {
    setSelectedOrder(order);
    setCourierDialogOpen(true);
  };

  // Buyurtma ma'lumotlarini ko'rish
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Buyurtmalar
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Buyurtma ID</TableCell>
                    <TableCell>Sana</TableCell>
                    <TableCell>Mijoz</TableCell>
                    <TableCell>Kurier</TableCell>
                    <TableCell>Holat</TableCell>
                    <TableCell align="right">Summa</TableCell>
                    <TableCell align="center">Amallar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2">
                            {order.user.firstName} {order.user.lastName}
                          </Typography>
                          {order.user.phoneNumber && (
                            <Typography variant="caption" color="textSecondary">
                              {order.user.phoneNumber}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {order.courier ? (
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              {order.courier.firstName} {order.courier.lastName}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            Tayinlanmagan
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            {
                              pending: 'Kutilmoqda',
                              processing: 'Jarayonda',
                              shipped: 'Yetkazilmoqda',
                              delivered: 'Yetkazildi',
                              cancelled: 'Bekor qilindi',
                            }[order.status]
                          }
                          color={
                            {
                              pending: 'warning',
                              processing: 'info',
                              shipped: 'info',
                              delivered: 'success',
                              cancelled: 'error',
                            }[order.status]
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {order.totalPrice.toLocaleString()} UZS
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedOrder(order);
                            setViewDialogOpen(true);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Buyurtma ko'rish dialogi */}
      <OrderViewDialog
        order={selectedOrder}
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onAssignCourier={handleAssignCourier}
        getStatusText={(status) => ({
          pending: 'Kutilmoqda',
          processing: 'Jarayonda',
          shipped: 'Yetkazilmoqda',
          delivered: 'Yetkazildi',
          cancelled: 'Bekor qilindi',
        }[status])}
        getStatusColor={(status) => ({
          pending: '#ed6c02',
          processing: '#0288d1',
          shipped: '#0288d1',
          delivered: '#2e7d32',
          cancelled: '#d32f2f',
        }[status])}
      />

      {/* Kuryer tayinlash dialogi */}
      <OrderCourierDialog
        open={courierDialogOpen}
        onClose={() => setCourierDialogOpen(false)}
        order={selectedOrder}
        onSuccess={() => {
          setCourierDialogOpen(false);
          fetchOrders(page);
        }}
      />

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Orders;
