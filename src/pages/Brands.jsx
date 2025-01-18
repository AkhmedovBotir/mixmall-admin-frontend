import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import brandAPI from '../api/brandAPI';
import BrandFormDialog from '../components/brands/BrandFormDialog';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Brendlarni yuklash
  const fetchBrands = async () => {
    try {
      setLoading(true);
      console.log('Brandlarni yuklash boshlandi');

      const response = await brandAPI.getAll(searchQuery);
      console.log('API javobi:', response);

      if (Array.isArray(response)) {
        console.log('Raw array format');
        setBrands(response);
        setTotal(response.length);
      }
      // Yangi format {success: true, data: {brands: [], total: 0}}
      else if (response.success && response.data?.brands) {
        console.log('Yangi format ishlatilmoqda');
        setBrands(response.data.brands);
        setTotal(response.data.total || response.data.brands.length);
      }
      // Eski format {status: 'success', data: {brands: [], total: 0}}
      else if (response.status === 'success' && response.data?.brands) {
        console.log('Eski format ishlatilmoqda');
        setBrands(response.data.brands);
        setTotal(response.data.total || response.data.brands.length);
      }
      // Raw object format {brands: [], total: 0}
      else if (response.brands) {
        console.log('Raw object format ishlatilmoqda');
        setBrands(response.brands);
        setTotal(response.total || response.brands.length);
      }
      else {
        console.error('API xatolik qaytardi:', response);
        showSnackbar('Brandlarni yuklashda xatolik yuz berdi', 'error');
      }
    } catch (error) {
      console.error('Brandlarni yuklashda xatolik:', error);
      
      if (error.status === 403) {
        showSnackbar('Brandlarni ko\'rish uchun ruxsat yo\'q', 'error');
      } else {
        showSnackbar(error.message || 'Brandlarni yuklashda xatolik yuz berdi', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Yangi brand qo'shish
  const handleCreateBrand = async (brandData) => {
    try {
      const name = brandData.name?.trim();
      if (!name) {
        showSnackbar('Brand nomi kiritilishi shart', 'error');
        return false;
      }

      console.log('Brand yaratish boshlandi:', name);
      const response = await brandAPI.create(name);
      console.log('Create brand response:', response);
      
      if (response._id) {  
        showSnackbar('Brand muvaffaqiyatli qo\'shildi', 'success');
        fetchBrands();
        setOpenFormDialog(false);
        return true;
      } else {
        console.error('API xatolik qaytardi:', response);
        showSnackbar('Brand qo\'shishda xatolik yuz berdi', 'error');
        return false;
      }
    } catch (error) {
      console.error('Brand qo\'shishda xatolik:', error);
      
      if (error.status === 403) {
        showSnackbar('Brand qo\'shish uchun ruxsat yo\'q', 'error');
      } else {
        showSnackbar(error.message || 'Brand qo\'shishda xatolik yuz berdi', 'error');
      }
      return false;
    }
  };

  // Brand tahrirlash
  const handleUpdateBrand = async (brandData) => {
    try {
      const name = brandData.name?.trim();
      if (!name) {
        showSnackbar('Brand nomi kiritilishi shart', 'error');
        return false;
      }

      console.log('Brand yangilash boshlandi:', { id: selectedBrand._id, name });
      const response = await brandAPI.update(selectedBrand._id, name);
      console.log('Update brand response:', response);
      
      // Yangilangan brand obyekti qaytadi
      if (response && response._id) {
        showSnackbar('Brand muvaffaqiyatli yangilandi', 'success');
        fetchBrands();
        setOpenFormDialog(false);
        return true;
      } else {
        console.error('API xatolik qaytardi:', response);
        showSnackbar('Brand yangilashda xatolik yuz berdi', 'error');
        return false;
      }
    } catch (error) {
      console.error('Brand yangilashda xatolik:', error);
      
      if (error.status === 403) {
        showSnackbar('Brand yangilash uchun ruxsat yo\'q', 'error');
      } else if (error.status === 404) {
        showSnackbar('Brand topilmadi', 'error');
      } else {
        showSnackbar(error.message || 'Brand yangilashda xatolik yuz berdi', 'error');
      }
      return false;
    }
  };

  // Brand o'chirish
  const handleDeleteBrand = async () => {
    try {
      if (!selectedBrand?._id) {
        showSnackbar('Brand tanlanmagan', 'error');
        return false;
      }

      console.log('Brand o\'chirish boshlandi:', selectedBrand._id);
      const success = await brandAPI.delete(selectedBrand._id);
      console.log('Delete brand response:', success);
      
      if (success) {
        showSnackbar('Brand muvaffaqiyatli o\'chirildi', 'success');
        fetchBrands();
        setOpenDeleteDialog(false);
        return true;
      } else {
        console.error('Brand o\'chirib bo\'lmadi');
        showSnackbar('Brand o\'chirishda xatolik yuz berdi', 'error');
        return false;
      }
    } catch (error) {
      console.error('Brand o\'chirishda xatolik:', error);
      
      if (error.status === 403) {
        showSnackbar('Brand o\'chirish uchun ruxsat yo\'q', 'error');
      } else if (error.status === 404) {
        showSnackbar('Brand topilmadi', 'error');
      } else {
        showSnackbar(error.message || 'Brand o\'chirishda xatolik yuz berdi', 'error');
      }
      return false;
    }
  };

  // Qidiruv o'zgarganida
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBrands();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Sahifa yuklanganda
  useEffect(() => {
    fetchBrands();
  }, []);

  // Brend qo'shish/tahrirlash
  const handleSubmit = async (brandData) => {
    if (formMode === 'add') {
      await handleCreateBrand(brandData);
    } else {
      await handleUpdateBrand(brandData);
    }
  };

  // Brendni o'chirishni tasdiqlash
  const handleConfirmDelete = async () => {
    await handleDeleteBrand();
    setOpenDeleteDialog(false);
    setSelectedBrand(null);
  };

  // Brendni o'chirish
  const handleDelete = async (brand) => {
    setSelectedBrand(brand);
    setOpenDeleteDialog(true);
  };

  // Filterlash
  const filteredBrands = useMemo(() => {
    return brands.filter(brand =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [brands, searchQuery]);

  // Snackbar xabari
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1a237e', fontWeight: 600 }}>
          Brendlar
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setFormMode('add');
            setSelectedBrand(null);
            setOpenFormDialog(true);
          }}
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: '#1a237e',
            '&:hover': {
              backgroundColor: '#0d47a1'
            }
          }}
        >
          Brend qo'shish
        </Button>
      </Box>

      <TextField
        placeholder="Qidirish..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nomi</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBrands.map((brand) => (
              <TableRow key={brand._id}>
                <TableCell>{brand.name}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => {
                      setFormMode('edit');
                      setSelectedBrand(brand);
                      setOpenFormDialog(true);
                    }}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(brand)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredBrands.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  Brendlar topilmadi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <BrandFormDialog
        open={openFormDialog}
        onClose={() => {
          setOpenFormDialog(false);
          setSelectedBrand(null);
        }}
        onSubmit={handleSubmit}
        brand={selectedBrand}
        mode={formMode}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setSelectedBrand(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Brendni o'chirish"
        content="Siz rostdan ham ushbu brendni o'chirmoqchimisiz?"
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

export default Brands;
