import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../api/axios';
import courierAPI from '../api/courierAPI';
import CourierList from '../components/couriers/CourierList';
import CourierFormDialog from '../components/couriers/CourierFormDialog';
import CourierViewDialog from '../components/couriers/CourierViewDialog';
import CourierDeleteDialog from '../components/couriers/CourierDeleteDialog';

const Couriers = () => {
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load couriers
  const fetchCouriers = async () => {
    try {
      const response = await api.get('/couriers');
      console.log('Couriers response:', response);

      // Backend {couriers: [...], pagination: {...}} formatida javob qaytaradi
      if (response.data?.couriers) {
        setCouriers(response.data.couriers);
      } else {
        console.error('Invalid response format:', response.data);
        showSnackbar('Kuryerlarni yuklashda xatolik yuz berdi', 'error');
      }
    } catch (error) {
      console.error('Kuryerlarni yuklashda xatolik:', error);
      showSnackbar(error.response?.data?.message || 'Kuryerlarni yuklashda xatolik yuz berdi', 'error');
    }
  };

  useEffect(() => {
    fetchCouriers();
  }, []);

  // Show snackbar message
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Kuryer qo'shish
  const handleCreateCourier = async (courierData) => {
    try {
      const response = await courierAPI.register(courierData);
      console.log('Create courier response:', response);
      
      if (response.success) {
        showSnackbar(response.message || 'Kuryer muvaffaqiyatli qo\'shildi', 'success');
        fetchCouriers();
        setOpenFormDialog(false);
        return true;
      }

      throw new Error('Kuryer qo\'shishda xatolik');
    } catch (error) {
      console.error('Kuryer qo\'shishda xatolik:', error);
      showSnackbar(error.message || 'Kuryer qo\'shishda xatolik yuz berdi', 'error');
      return false;
    }
  };

  // Kuryer tahrirlash
  const handleEditCourier = async (courierData) => {
    try {
      const response = await courierAPI.update(selectedCourier._id, courierData);
      console.log('Update response:', response);
      
      showSnackbar(response.message, 'success');
      fetchCouriers();
      setOpenFormDialog(false);
      setSelectedCourier(null);
    } catch (error) {
      console.error('Kuryer tahrirlashda xatolik:', error);
      showSnackbar(error.message || 'Kuryer ma\'lumotlarini yangilashda xatolik', 'error');
    }
  };

  // Kuryerni o'chirish
  const handleDeleteCourier = async (id) => {
    try {
      const response = await courierAPI.delete(id);
      console.log('Delete response:', response);
      
      showSnackbar(response.message, 'success');
      fetchCouriers();
      setOpenDeleteDialog(false);
      setSelectedCourier(null);
    } catch (error) {
      console.error('Kuryerni o\'chirishda xatolik:', error);
      showSnackbar(error.message || 'Kuryerni o\'chirishda xatolik', 'error');
    }
  };

  // Qidiruv
  const filteredCouriers = couriers.filter(courier =>
    (`${courier.firstName} ${courier.lastName}`.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (courier.phoneNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1a237e', fontWeight: 600 }}>
          Kuryerlar
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#1a237e',
            '&:hover': {
              backgroundColor: '#0d47a1'
            }
          }}
          onClick={() => {
            setFormMode('add');
            setSelectedCourier(null);
            setOpenFormDialog(true);
          }}
        >
          Yangi kuryer qo'shish
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Kuryerlarni qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#1a237e' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#1a237e',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1a237e',
              },
            },
          }}
        />
      </Box>

      <CourierList
        couriers={filteredCouriers}
        onView={(courier) => {
          setSelectedCourier(courier);
          setOpenViewDialog(true);
        }}
        onEdit={(courier) => {
          setSelectedCourier(courier);
          setFormMode('edit');
          setOpenFormDialog(true);
        }}
        onDelete={(courier) => {
          setSelectedCourier(courier);
          setOpenDeleteDialog(true);
        }}
      />

      <CourierFormDialog
        open={openFormDialog}
        onClose={() => {
          setOpenFormDialog(false);
          setSelectedCourier(null);
        }}
        onSubmit={formMode === 'add' ? handleCreateCourier : handleEditCourier}
        courier={selectedCourier}
        mode={formMode}
      />

      <CourierViewDialog
        open={openViewDialog}
        onClose={() => {
          setOpenViewDialog(false);
          setSelectedCourier(null);
        }}
        courier={selectedCourier}
      />

      <CourierDeleteDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setSelectedCourier(null);
        }}
        onConfirm={() => handleDeleteCourier(selectedCourier._id)}
        courierName={selectedCourier ? `${selectedCourier.firstName} ${selectedCourier.lastName}` : ''}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Couriers;
