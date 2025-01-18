import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { api } from '../utils/api';
import { useSnackbar } from '../hooks/useSnackbar';
import { socket } from '../utils/socket';
import CategoryList from '../components/categories/CategoryList';
import CategoryFormDialog from '../components/categories/CategoryFormDialog';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // Socket events
  useEffect(() => {
    socket.on('categoryUpdate', (data) => {
      console.log('Socket: Category update received:', data);
      fetchCategories();
    });

    return () => {
      socket.off('categoryUpdate');
    };
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      
      console.log('Fetched categories:', response);
      
      // Response tekshirish
      if (!response || response.status !== 'success') {
        throw new Error(response?.message || 'Kategoriyalarni yuklashda xatolik');
      }

      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showSnackbar(
        error.response?.data?.message || 'Kategoriyalarni yuklashda xatolik',
        'error'
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Form dialog
  const handleOpenFormDialog = (mode = 'add', category = null) => {
    setFormMode(mode);
    setSelectedCategory(category);
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setSelectedCategory(null);
  };

  // Delete dialog
  const handleOpenDeleteDialog = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleDelete = async () => {
    if (!categoryToDelete?._id) return;

    try {
      setLoading(true);
      const response = await api.delete(`/categories/${categoryToDelete._id}`);

      console.log('Delete response:', response);

      // Response tekshirish
      if (!response || response.status !== 'success') {
        throw new Error(response?.message || 'Kategoriyani o\'chirishda xatolik');
      }

      // Socket event yuborish
      socket.emit('categoryUpdate', {
        type: 'CATEGORY_DELETED',
        categoryId: categoryToDelete._id
      });

      showSnackbar('Kategoriya muvaffaqiyatli o\'chirildi', 'success');
      handleCloseDeleteDialog();
      fetchCategories();

    } catch (error) {
      console.error('Error deleting category:', error);
      
      let errorMessage = 'Kategoriyani o\'chirishda xatolik';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      const formDataToSend = new FormData();

      // Asosiy maydonlar
      formDataToSend.append('name', formData.name);
      if (formMode === 'edit') {
        formDataToSend.append('status', formData.status || 'active');
      }

      // Rasm
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      }

      // Subkategoriyalar
      if (formData.subcategories?.length > 0) {
        formData.subcategories.forEach((sub, index) => {
          if (sub._id) {
            // Mavjud subkategoriya
            formDataToSend.append(`subcategories[${index}][_id]`, sub._id);
            formDataToSend.append(`subcategories[${index}][name]`, sub.name);
            formDataToSend.append(`subcategories[${index}][status]`, sub.status || 'active');
          } else {
            // Yangi subkategoriya
            formDataToSend.append(`subcategories[${index}][name]`, sub.name);
            formDataToSend.append(`subcategories[${index}][status]`, 'active');
          }
        });
      }

      // Request data ni log qilish
      console.log('Form data:', formData);
      console.log('FormData entries:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await api({
        method: formMode === 'add' ? 'post' : 'put',
        url: formMode === 'add' ? '/categories' : `/categories/${formData._id}`,
        data: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Response:', response);

      // Response tekshirish
      if (!response || response.status !== 'success') {
        throw new Error(response?.message || 'Xatolik yuz berdi');
      }

      // Socket event yuborish
      socket.emit('categoryUpdate', {
        type: formMode === 'add' ? 'CATEGORY_CREATED' : 'CATEGORY_UPDATED',
        category: response.data
      });

      showSnackbar(
        formMode === 'add'
          ? "Kategoriya muvaffaqiyatli qo'shildi"
          : 'Kategoriya muvaffaqiyatli yangilandi',
        'success'
      );
      
      handleCloseFormDialog();
      fetchCategories();

    } catch (error) {
      console.error('Error submitting category:', error);
      console.log('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        } : undefined
      });

      let errorMessage = 'Xatolik yuz berdi';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">
          Kategoriyalar
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenFormDialog('add')}
          disabled={loading}
        >
          Yangi kategoriya
        </Button>
      </Box>

      {/* Kategoriyalar ro'yxati */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CategoryList
          categories={categories}
          onEdit={(category) => handleOpenFormDialog('edit', category)}
          onDelete={handleOpenDeleteDialog}
        />
      )}

      {/* Form dialog */}
      <CategoryFormDialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        onSubmit={handleSubmit}
        mode={formMode}
        category={selectedCategory}
        loading={loading}
      />

      {/* Delete dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>
          Kategoriyani o'chirish
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Rostdan ham {categoryToDelete?.name} kategoriyasini o'chirmoqchimisiz?
            {'\n'}
            Bu amalni ortga qaytarib bo'lmaydi.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            O'chirish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
