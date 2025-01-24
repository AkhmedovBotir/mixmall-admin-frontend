import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
  InputLabel,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import api from '../../api/axios';

// Huquqlar ro'yxati
const permissions = [
  // Dashboard
  { value: 'view_dashboard', label: 'Dashboard ko\'rish' },
  
  // Products
  { value: 'manage_products', label: 'Mahsulotlarni boshqarish' },
  { value: 'manage_categories', label: 'Kategoriyalarni boshqarish' },
  { value: 'manage_brands', label: 'Brendlarni boshqarish' },
  
  // Orders
  { value: 'manage_orders', label: 'Buyurtmalarni boshqarish' },
  { value: 'manage_shipping', label: 'Yetkazib berishni boshqarish' },
  { value: 'manage_payments', label: 'To\'lovlarni boshqarish' },
  
  // Users
  { value: 'manage_users', label: 'Foydalanuvchilarni boshqarish' },
  { value: 'manage_admins', label: 'Adminlarni boshqarish' },
  
  // Marketing
  { value: 'manage_banners', label: 'Bannerlarni boshqarish' },
  
  // Content
  { value: 'manage_reviews', label: 'Sharhlarni boshqarish' },
  
  // Support
  { value: 'manage_feedback', label: 'Fikr-mulohazalarni boshqarish' },
  { value: 'manage_notifications', label: 'Bildirishnomalarni boshqarish' },
  
  // Reports
  { value: 'view_statistics', label: 'Statistikani ko\'rish' },
  { value: 'manage_reports', label: 'Hisobotlarni boshqarish' },
  
  // Settings
  { value: 'manage_settings', label: 'Tizim sozlamalarini boshqarish' },
  
  // Couriers
  { value: 'manage_couriers', label: 'Kurierlarni boshqarish' },
];

const AdminFormDialog = ({
  open,
  onClose,
  onSubmit,
  admin,
  mode
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    status: 'active',
    role: 'admin',
    permissions: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'active', label: 'Faol' },
    { value: 'inactive', label: 'Nofaol' },
    { value: 'blocked', label: 'Bloklangan' }
  ];

  useEffect(() => {
    if (admin) {
      const initialData = {
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.email || '',
        password: '',
        status: admin.status || 'active',
        role: admin.role || 'admin',
        permissions: admin.permissions || []
      };
      console.log('Admin ma\'lumotlari:', admin);
      console.log('Boshlang\'ich form ma\'lumotlari:', initialData);
      setFormData(initialData);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        status: 'active',
        role: 'admin',
        permissions: []
      });
    }
  }, [admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Form boshlang\'ich ma\'lumotlari:', formData);

    // Form ma'lumotlarini trim qilish
    const trimmedData = {
      ...formData,
      firstName: formData.firstName?.trim(),
      lastName: formData.lastName?.trim(),
      email: formData.email?.trim(),
      password: formData.password?.trim()
    };

    console.log('Trim qilingan form ma\'lumotlari:', trimmedData);

    const errors = [];

    // Validatsiya
    if (!trimmedData.firstName) {
      errors.push('Ism kiritilishi shart');
    } else if (trimmedData.firstName.length < 2 || trimmedData.firstName.length > 50) {
      errors.push('Ism 2-50 ta belgidan iborat bo\'lishi kerak');
    }

    if (!trimmedData.lastName) {
      errors.push('Familiya kiritilishi shart');
    } else if (trimmedData.lastName.length < 2 || trimmedData.lastName.length > 50) {
      errors.push('Familiya 2-50 ta belgidan iborat bo\'lishi kerak');
    }

    if (mode !== 'edit') {
      if (!trimmedData.email) {
        errors.push('Email kiritilishi shart');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedData.email)) {
          errors.push('Email noto\'g\'ri formatda');
        }
      }

      if (!trimmedData.password) {
        errors.push('Parol kiritilishi shart');
      } else if (trimmedData.password.length < 6) {
        errors.push('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      }
    }

    if (!trimmedData.permissions.length) {
      errors.push('Kamida bitta ruxsat tanlanishi kerak');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      setLoading(false);
      return;
    }

    try {
      console.log('onSubmit ga yuborilayotgan ma\'lumotlar:', trimmedData);

      let success = false;
      if (mode === 'edit' && admin) {
        // Admin ID va ma'lumotlarni alohida yuborish
        success = await onSubmit(trimmedData, admin._id);
      } else {
        success = await onSubmit(trimmedData);
      }

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Admin saqlashda xatolik:', error);
      let errorMessage = 'Xatolik yuz berdi';
      
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors);
        errorMessage = errors.flat().join(', ');
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
    >
      <DialogTitle>
        {mode === 'edit' ? 'Adminni tahrirlash' : 'Yangi admin qo\'shish'}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Ism"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          margin="normal"
          required
          error={!formData.firstName.trim()}
        />

        <TextField
          fullWidth
          label="Familiya"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          margin="normal"
          required
          error={!formData.lastName.trim()}
        />

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          margin="normal"
          required
          error={!formData.email.trim()}
        />

        <TextField
          fullWidth
          label="Parol"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          margin="normal"
          required={mode !== 'edit'}
          error={mode !== 'edit' && (!formData.password.trim() || formData.password.trim().length < 6)}
          helperText={mode === 'edit' ? "Parolni o'zgartirish uchun to'ldiring" : ''}
        />

        {mode === 'edit' && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              label="Status"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Ruxsatlar:
          </Typography>
          <FormGroup>
            {permissions.map((permission) => (
              <FormControlLabel
                key={permission.value}
                control={
                  <Checkbox
                    checked={formData.permissions.includes(permission.value)}
                    onChange={() => {
                      const newPermissions = formData.permissions.includes(permission.value)
                        ? formData.permissions.filter(p => p !== permission.value)
                        : [...formData.permissions, permission.value];
                      setFormData({ ...formData, permissions: newPermissions });
                    }}
                  />
                }
                label={permission.label}
              />
            ))}
          </FormGroup>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {mode === 'edit' ? 'Saqlash' : 'Qo\'shish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminFormDialog;
