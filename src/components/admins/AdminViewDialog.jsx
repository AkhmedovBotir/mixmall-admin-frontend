import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

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

const AdminViewDialog = ({
  open,
  onClose,
  admin,
}) => {
  if (!admin) return null;

  const getPermissionLabel = (permissionName) => {
    const permission = permissions.find(p => p.value === permissionName);
    return permission ? permission.label : permissionName;
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
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle sx={{ backgroundColor: '#f5f5f5', py: 2 }}>
        <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
          Admin ma'lumotlari
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PersonIcon sx={{ color: '#1a237e' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Ism
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {admin.name}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EmailIcon sx={{ color: '#1a237e' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {admin.email}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AdminIcon sx={{ color: '#1a237e' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {admin.role === 'superadmin' ? 'Super admin' : 'Admin'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 2, color: '#1a237e', fontWeight: 600 }}>
              Ruxsatlar
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {admin.permissions && admin.permissions.length > 0 ? (
                admin.permissions.map((permission) => (
                  <Chip
                    key={permission}
                    label={getPermissionLabel(permission)}
                    sx={{
                      backgroundColor: '#e8eaf6',
                      color: '#1a237e',
                    }}
                  />
                ))
              ) : (
                <Typography color="text.secondary">
                  Ruxsatlar yo'q
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, backgroundColor: '#f5f5f5' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#1a237e',
            '&:hover': {
              backgroundColor: 'rgba(26, 35, 126, 0.04)',
            },
          }}
        >
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminViewDialog;
