import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const BrandFormDialog = ({
  open,
  onClose,
  onSubmit,
  brand,
  mode,
}) => {
  const [formData, setFormData] = useState({
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || ''
      });
    } else {
      setFormData({
        name: ''
      });
    }
  }, [brand]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Form boshlang\'ich ma\'lumotlari:', formData);

    // Nomni trim qilish
    const name = formData.name?.trim();

    console.log('Trim qilingan nom:', name);

    // Validatsiya
    if (!name) {
      setError('Brand nomi kiritilishi shart');
      setLoading(false);
      return;
    }

    if (name.length < 2 || name.length > 50) {
      setError('Brand nomi 2-50 ta belgidan iborat bo\'lishi kerak');
      setLoading(false);
      return;
    }

    try {
      const success = await onSubmit({ name });
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Brand saqlashda xatolik:', error);
      let errorMessage = 'Xatolik yuz berdi';
      
      if (error.response?.data?.errors?.name) {
        errorMessage = error.response.data.errors.name.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ backgroundColor: '#f5f5f5', pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
            {mode === 'add' ? 'Yangi brend qo\'shish' : 'Brendni tahrirlash'}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#1a237e',
              '&:hover': {
                backgroundColor: 'rgba(26, 35, 126, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            name="name"
            label="Brend nomi"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            error={!!error}
            helperText={error}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#1a237e',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a237e',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#1a237e',
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              color: '#1a237e',
              borderColor: '#1a237e',
              '&:hover': {
                borderColor: '#0d47a1',
                backgroundColor: 'rgba(26, 35, 126, 0.04)'
              }
            }}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#0d47a1'
              }
            }}
            disabled={loading}
          >
            {mode === 'add' ? 'Qo\'shish' : 'Saqlash'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BrandFormDialog;
