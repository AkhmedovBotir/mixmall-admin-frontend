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
import api from '../utils/api';

const OrderCourierDialog = ({
  open,
  onClose,
  onAssign,
  order,
}) => {
  const [couriers, setCouriers] = useState([]);
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchCouriers();
    }
  }, [open]);

  const fetchCouriers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/couriers');
      console.log('Kuryerlar response:', response);
      
      if (response?.data?.couriers && Array.isArray(response.data.couriers)) {
        // Faqat faol kuryerlarni olish
        const activeCouriers = response.data.couriers.filter((courier) => 
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
      const errorMessage = error.response?.data?.message || error.message || 'Kuryerlarni yuklashda xatolik yuz berdi';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (!selectedCourierId) {
      setError('Kuryer tanlanmagan');
      return;
    }
    const courier = couriers.find(c => c._id === selectedCourierId);
    if (!courier) {
      setError('Kuryer topilmadi');
      return;
    }
    onAssign(courier);
    setSelectedCourierId('');
  };

  const handleClose = () => {
    setSelectedCourierId('');
    setError(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box>
          <Typography variant="h6">
            Kuryer tayinlash
          </Typography>
          {order && (
            <Typography variant="body2" color="textSecondary">
              Buyurtma #{order.orderId}
            </Typography>
          )}
        </Box>
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
              value={selectedCourierId}
              onChange={(e) => setSelectedCourierId(e.target.value)}
              label="Kuryer"
            >
              {couriers.map((courier) => (
                <MenuItem key={courier._id} value={courier._id}>
                  {courier.firstName} {courier.lastName} ({courier.vehicle} - {courier.vehicleNumber})
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
          disabled={!selectedCourierId || loading}
        >
          Tayinlash
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderCourierDialog;
