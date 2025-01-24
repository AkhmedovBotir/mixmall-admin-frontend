import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/axios';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const CourierDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Dostavkalarni olish
  const fetchDeliveries = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token topilmadi');
      }

      const response = await axios.get('/orders/courier-deliveries', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('API Response:', response.data);
      setDeliveries(response.data);
      setError('');
    } catch (error) {
      console.error('Dostavkalarni yuklashda xatolik:', error);
      const errorMessage = error.response?.data?.message || 'Dostavkalarni yuklashda xatolik yuz berdi';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Filterlangan dostavkalar
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(delivery => {
      const matchesSearch = 
        delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.user?.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.address?.address?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deliveries, searchTerm, statusFilter]);

  // Status uchun text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Kutilmoqda';
      case 'confirmed':
        return 'Tasdiqlangan';
      case 'processing':
        return 'Jarayonda';
      case 'shipped':
        return 'Kuryerda';
      case 'delivered':
        return 'Yetkazildi';
      case 'cancelled':
        return 'Bekor qilindi';
      default:
        return status;
    }
  };

  // Status uchun rang
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Dostavkani ko'rish
  const handleDeliveryClick = (delivery) => {
    setSelectedDelivery(delivery);
  };

  // Modalni yopish
  const handleCloseDialog = () => {
    setSelectedDelivery(null);
  };

  // Snackbar yopish
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Status o'zgartirish
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token topilmadi');
      }

      await axios.put(
        `/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Ma'lumotlarni yangilash
      fetchDeliveries();
      
      // Modalni yopish
      handleCloseDialog();
      
      // Muvaffaqiyatli xabar
      setSnackbar({
        open: true,
        message: 'Status muvaffaqiyatli yangilandi',
        severity: 'success'
      });
    } catch (error) {
      console.error('Status o\'zgartirishda xatolik:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Status o\'zgartirishda xatolik yuz berdi',
        severity: 'error'
      });
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Qidirish"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status bo'yicha filterlash</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status bo'yicha filterlash"
              >
                <MenuItem value="all">Barchasi</MenuItem>
                <MenuItem value="shipped">Kuryerda</MenuItem>
                <MenuItem value="delivered">Yetkazildi</MenuItem>
                <MenuItem value="cancelled">Bekor qilindi</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              Jami: {filteredDeliveries.length} ta buyurtma
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Dostavkalar</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            onClick={fetchDeliveries}
          >
            Yangilash
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : filteredDeliveries.length === 0 ? (
        <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          Dostavkalar mavjud emas
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredDeliveries.map((delivery) => (
            <Grid item xs={12} sm={6} md={4} key={delivery._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 6 }
                }}
                onClick={() => handleDeliveryClick(delivery)}
              >
                <CardContent>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">
                      #{delivery.orderId}
                    </Typography>
                    <Chip
                      label={getStatusText(delivery.status)}
                      color={getStatusColor(delivery.status)}
                      size="small"
                    />
                  </Box>

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="action" fontSize="small" />
                      <Typography variant="body2" noWrap>
                        {delivery.user.firstName} {delivery.user.lastName}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon color="action" fontSize="small" />
                      <Typography variant="body2" noWrap>
                        {delivery.address.address}
                        {delivery.address.entrance && `, ${delivery.address.entrance}-kirish`}
                        {delivery.address.floor && `, ${delivery.address.floor}-qavat`}
                        {delivery.address.apartment && `, ${delivery.address.apartment}`}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        {delivery.user.phoneNumber}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        {new Date(delivery.createdAt).toLocaleString()}
                      </Typography>
                    </Box>

                    <Divider />

                    <Typography variant="subtitle2" color="primary">
                      {delivery.items.length} ta mahsulot
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {delivery.totalPrice.toLocaleString()} so'm
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Buyurtma ma'lumotlari modali */}
      <Dialog
        open={!!selectedDelivery}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedDelivery && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">
                    Buyurtma #{selectedDelivery.orderId}
                  </Typography>
                  <Chip
                    label={getStatusText(selectedDelivery.status)}
                    color={getStatusColor(selectedDelivery.status)}
                    size="small"
                  />
                </Box>
                <IconButton onClick={handleCloseDialog} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Buyurtma #{selectedDelivery.orderId}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Mijoz:</strong> {selectedDelivery.user.firstName} {selectedDelivery.user.lastName}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Telefon:</strong> {selectedDelivery.user.phoneNumber}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Manzil:</strong> {selectedDelivery.address.address}
                  {selectedDelivery.address.entrance && `, ${selectedDelivery.address.entrance}-kirish`}
                  {selectedDelivery.address.floor && `, ${selectedDelivery.address.floor}-qavat`}
                  {selectedDelivery.address.apartment && `, ${selectedDelivery.address.apartment}`}
                </Typography>

                {selectedDelivery.address.domofonCode && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Domofon:</strong> {selectedDelivery.address.domofonCode}
                  </Typography>
                )}

                {selectedDelivery.address.courierComment && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Kuryer uchun izoh:</strong> {selectedDelivery.address.courierComment}
                  </Typography>
                )}

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Mahsulotlar:
                </Typography>
                <Stack spacing={1}>
                  {selectedDelivery.items.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        {item.product.name} x {item.quantity} ta
                      </Typography>
                      <Typography variant="body2">
                        {(item.price * item.quantity).toLocaleString()} so'm
                      </Typography>
                    </Box>
                  ))}
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">
                      Jami:
                    </Typography>
                    <Typography variant="subtitle2">
                      {selectedDelivery.totalPrice.toLocaleString()} so'm
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Sana: {new Date(selectedDelivery.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Box>
                {selectedDelivery.status === 'shipped' && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleStatusChange(selectedDelivery._id, 'delivered')}
                  >
                    Yetkazildi
                  </Button>
                )}
                
                {/* {selectedDelivery.status === 'shipped' && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleStatusChange(selectedDelivery._id, 'cancelled')}
                    sx={{ ml: 1 }}
                  >
                    Bekor qilish
                  </Button>
                )} */}
              </Box>
              
              <Button onClick={handleCloseDialog} color="inherit">
                Yopish
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
    </Box>
  );
};

export default CourierDeliveries;
