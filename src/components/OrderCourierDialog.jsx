import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

const OrderCourierDialog = ({
  open,
  onClose,
  onAssign,
  order,
}) => {
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchCouriers();
    }
  }, [open]);

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

  const fetchCouriers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!checkPermissions()) {
        setError('Buyurtmalarni va kuryerlarni boshqarish uchun huquqlar yetarli emas');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Avtorizatsiyadan o\'tilmagan');
        return;
      }

      const response = await axios.get('https://api.example.com/couriers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (Array.isArray(response.data)) {
        // Faqat faol kuryerlarni olish
        const activeCouriers = response.data.filter((courier) => 
          courier && courier.status === 'active'
        );
        
        if (activeCouriers.length === 0) {
          setError('Faol kuryerlar mavjud emas');
        }
        
        setCouriers(activeCouriers);
      } else {
        throw new Error('Noto\'g\'ri ma\'lumot formati');
      }
    } catch (error) {
      console.error('Kuryerlarni yuklashda xatolik:', error);
      const errorMessage = error.response?.data?.message || 'Kuryerlarni yuklashda xatolik yuz berdi';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (!order || !selectedCourier) {
      setError('Kuryer tanlanmagan');
      return;
    }
    onAssign(order._id, selectedCourier);
    setSelectedCourier('');
  };

  const handleClose = () => {
    setSelectedCourier('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Kuryer tayinlash
          {order && (
            <Typography variant="subtitle2" color="textSecondary">
              Buyurtma #{order.orderId}
            </Typography>
          )}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : couriers.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Faol kuryerlar mavjud emas
          </Alert>
        ) : (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Kuryer</InputLabel>
            <Select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              label="Kuryer"
            >
              {couriers.map((courier) => (
                <MenuItem key={courier._id} value={courier._id}>
                  {courier.firstName} {courier.lastName} ({courier.vehicle.name} - {courier.vehicle.number})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Bekor qilish
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={!selectedCourier || loading}
        >
          Tayinlash
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderCourierDialog;
