import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import adminAPI from '../api/adminAPI';
import AdminFormDialog from '../components/admins/AdminFormDialog';
import AdminViewDialog from '../components/admins/AdminViewDialog';
import AdminDeleteDialog from '../components/admins/AdminDeleteDialog';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
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

  // Adminlarni yuklash
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAll({
        page: 1,
        limit: 100,
        search: searchQuery || undefined
      });
      console.log('API javob:', response);

      // Yangi format {success: true, data: {admins: []}}
      if (response.success && response.data?.admins) {
        const sortedData = response.data.admins.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setAdmins(sortedData);
      }
      // Eski format {status: 'success', data: {admins: []}}
      else if (response.status === 'success' && response.data?.admins) {
        const sortedData = response.data.admins.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setAdmins(sortedData);
      }
      // Raw response {admins: []}
      else if (response.admins) {
        const sortedData = response.admins.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setAdmins(sortedData);
      }
      else {
        console.error('API xatolik qaytardi:', response);
        showSnackbar('Adminlarni yuklashda xatolik yuz berdi', 'error');
      }
    } catch (error) {
      console.error('Adminlarni yuklashda xatolik:', error);
      showSnackbar(error.message || 'Adminlarni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Qidiruv va filtrlash
  const filteredAdmins = useMemo(() => {
    if (!admins) return [];
    
    // Avval qidiruvni amalga oshiramiz
    const filtered = admins.filter(admin => {
      const searchLower = searchQuery.toLowerCase();
      return (
        admin.firstName.toLowerCase().includes(searchLower) ||
        admin.lastName.toLowerCase().includes(searchLower) ||
        admin.email.toLowerCase().includes(searchLower) ||
        admin.role.toLowerCase().includes(searchLower)
      );
    });

    // So'ngra tartiblaymiz: superadmin > yaratilgan sana (teskari tartib)
    return filtered.sort((a, b) => {
      // Superadmin doim yuqorida
      if (a.role === 'superadmin') return -1;
      if (b.role === 'superadmin') return 1;
      
      // Qolgan adminlarni yaratilgan sanasi bo'yicha teskari tartiblaymiz
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [admins, searchQuery]);

  // Admin qo'shish
  const handleAddAdmin = async (adminData) => {
    try {
      console.log('Admin qo\'shish boshlandi:', adminData);
      const response = await adminAPI.create(adminData);
      console.log('API javob:', response);

      if (response.admin) {
        showSnackbar('Admin muvaffaqiyatli qo\'shildi', 'success');
        fetchAdmins();
        setOpenFormDialog(false);
      } else {
        console.error('API xatolik qaytardi:', response);
        showSnackbar(response.message || 'Admin qo\'shishda xatolik yuz berdi', 'error');
      }
    } catch (error) {
      console.error('Admin qo\'shishda xatolik:', error);
      
      if (error.status === 403) {
        showSnackbar('Admin qo\'shish uchun ruxsat yo\'q', 'error');
      } else if (error.status === 409) {
        showSnackbar('Bunday email allaqachon mavjud', 'error');
      } else {
        showSnackbar(error.message || 'Admin qo\'shishda xatolik yuz berdi', 'error');
      }
    }
  };

  // Admin tahrirlash
  const handleEditAdmin = async (adminData) => {
    try {
      console.log('Admin tahrirlash boshlandi:', adminData);
      const response = await adminAPI.update(selectedAdmin._id, adminData);
      console.log('API javob:', response);

      if (response.admin) {
        showSnackbar('Admin muvaffaqiyatli tahrirlandi', 'success');
        fetchAdmins();
        setOpenFormDialog(false);
      } else {
        console.error('API xatolik qaytardi:', response);
        showSnackbar(response.message || 'Admin tahrirlashda xatolik yuz berdi', 'error');
      }
    } catch (error) {
      console.error('Admin tahrirlashda xatolik:', error);
      
      if (error.status === 403) {
        showSnackbar('Admin tahrirlash uchun ruxsat yo\'q', 'error');
      } else if (error.status === 404) {
        showSnackbar('Admin topilmadi', 'error');
      } else if (error.status === 409) {
        showSnackbar('Bunday email allaqachon mavjud', 'error');
      } else {
        showSnackbar(error.message || 'Admin tahrirlashda xatolik yuz berdi', 'error');
      }
    }
  };

  // Admin o'chirish
  const handleDeleteAdmin = async () => {
    try {
      const response = await adminAPI.delete(selectedAdmin._id);
      console.log('Delete response:', response);
      
      if (response.success) {
        showSnackbar(response.message, 'success');
        fetchAdmins();
        setOpenDeleteDialog(false);
      } else {
        showSnackbar(response.message, 'error');
      }
    } catch (error) {
      console.error('Admin o\'chirishda xatolik:', error);
      
      if (error.status === 403) {
        showSnackbar(error.message, 'error');
      } else if (error.status === 404) {
        showSnackbar(error.message, 'error');
      } else {
        showSnackbar(error.message || 'Admin o\'chirishda xatolik yuz berdi', 'error');
      }
    }
  };

  // Super adminni o'chirish taqiqlangan
  const handleDelete = async (id) => {
    const adminToDelete = admins.find(admin => admin._id === id);
    if (adminToDelete?.role === 'superadmin') {
      showSnackbar('Super adminni o\'chirish mumkin emas', 'error');
      return;
    }

    try {
      setLoading(true);
      await adminAPI.delete(id);
      fetchAdmins();
      showSnackbar('Admin muvaffaqiyatli o\'chirildi', 'success');
    } catch (error) {
      console.error('Delete admin error:', error);
      showSnackbar(error.message || 'Adminni o\'chirishda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Super adminni tahrirlash taqiqlangan
  const handleEdit = (admin) => {
    if (admin.role === 'superadmin') {
      showSnackbar('Super adminni tahrirlash mumkin emas', 'error');
      return;
    }
    setSelectedAdmin(admin);
    setFormMode('edit');
    setOpenFormDialog(true);
  };

  // Snackbar xabarini ko'rsatish
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Adminni ko'rish dialogini ochish
  const handleView = (admin) => {
    setSelectedAdmin(admin);
    setOpenViewDialog(true);
  };

  // O'chirish dialogini ochish
  const handleOpenDeleteDialog = (admin) => {
    setSelectedAdmin(admin);
    setOpenDeleteDialog(true);
  };

  // Permission translations
  const permissionTranslations = {
    // Dashboard
    'view_dashboard': 'Dashboard ko\'rish',
    
    // Products
    'manage_products': 'Mahsulotlarni boshqarish',
    'manage_categories': 'Kategoriyalarni boshqarish',
    'manage_brands': 'Brendlarni boshqarish',
    
    // Orders
    'manage_orders': 'Buyurtmalarni boshqarish',
    'manage_shipping': 'Yetkazib berishni boshqarish',
    'manage_payments': 'To\'lovlarni boshqarish',
    
    // Users
    'manage_users': 'Foydalanuvchilarni boshqarish',
    'manage_admins': 'Adminlarni boshqarish',
    
    // Marketing
    'manage_banners': 'Bannerlarni boshqarish',
    
    // Content
    'manage_reviews': 'Sharhlarni boshqarish',
    
    // Support
    'manage_feedback': 'Fikr-mulohazalarni boshqarish',
    'manage_notifications': 'Bildirishnomalarni boshqarish',
    
    // Reports
    'view_statistics': 'Statistikani ko\'rish',
    'manage_reports': 'Hisobotlarni boshqarish',
    
    // Settings
    'manage_settings': 'Tizim sozlamalarini boshqarish',
    
    // Couriers
    'manage_couriers': 'Kurierlarni boshqarish',
  };

  const getPermissionLabel = (permission) => {
    return permissionTranslations[permission] || permission;
  };

  // Huquqlar ro'yxatini olish
  const getPermissionsList = (admin) => {
    if (!admin.permissions || admin.permissions.length === 0) {
      return <Chip label="Ruxsatlar yo'q" color="default" size="small" />;
    }
    return admin.permissions.map((permission, index) => (
      <Chip
        key={index}
        label={getPermissionLabel(permission)}
        size="small"
        sx={{ m: 0.5 }}
        color="primary"
      />
    ));
  };

  useEffect(() => {
    fetchAdmins();
  }, [searchQuery]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Adminlar
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedAdmin(null);
            setFormMode('add');
            setOpenFormDialog(true);
          }}
          sx={{
            bgcolor: '#1a237e',
            '&:hover': {
              bgcolor: '#0d47a1',
            },
          }}
        >
          Yangi admin
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Admin qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ bgcolor: 'background.paper' }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>
                  <Typography sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    F.I.O
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    Email
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    Status
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    Ruxsatlar
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    Amallar
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow
                  key={admin._id}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {admin.firstName} {admin.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={admin.status === 'active' ? 'Faol' : 'Nofaol'}
                      color={admin.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {getPermissionsList(admin)}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleView(admin)}
                      sx={{ color: '#4caf50' }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleEdit(admin)}
                      disabled={admin.role === 'superadmin'}
                      sx={{ color: '#1a237e' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenDeleteDialog(admin)}
                      disabled={admin.role === 'superadmin'}
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <AdminFormDialog
        open={openFormDialog}
        onClose={() => {
          if (handleAddAdmin || handleEditAdmin) {
            setOpenFormDialog(false);
          }
        }}
        onSubmit={formMode === 'add' ? handleAddAdmin : (data) => handleEditAdmin(data)}
        admin={selectedAdmin}
        mode={formMode}
      />

      <AdminViewDialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        admin={selectedAdmin}
      />

      <AdminDeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteAdmin}
        adminName={selectedAdmin ? `${selectedAdmin.firstName} ${selectedAdmin.lastName}` : ''}
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

export default Admins;
