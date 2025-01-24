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
import api from '../utils/api';
import { useSnackbar } from '../hooks/useSnackbar';
import socket from '../socket';
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
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
      const response = await api.get('/api/categories');
      
      if (response.status === 'success' && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error('Kutilmagan server javobi:', response);
        showSnackbar('Kategoriyalarni yuklashda xatolik', 'error');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showSnackbar(
        error.message || 'Kategoriyalarni yuklashda xatolik',
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

  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);

      const data = new FormData();
      data.append('name', formData.name);
      if (formData.image) {
        data.append('image', formData.image);
      }
      if (formData.subcategories?.length) {
        data.append('subcategories', JSON.stringify(formData.subcategories));
      }

      if (formMode === 'edit' && selectedCategory?._id) {
        await api.put(`/api/categories/${selectedCategory._id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        showSnackbar('Kategoriya muvaffaqiyatli yangilandi', 'success');
      } else {
        await api.post('/api/categories', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        showSnackbar('Kategoriya muvaffaqiyatli qo\'shildi', 'success');
      }

      setFormDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error submitting category:', error);
      showSnackbar(
        error.message || 'Kategoriyani saqlashda xatolik yuz berdi',
        'error'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/api/categories/${categoryToDelete._id}`);
      showSnackbar('Kategoriya muvaffaqiyatli o\'chirildi', 'success');
      setDeleteDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showSnackbar(
        error.message || 'Kategoriyani o\'chirishda xatolik yuz berdi',
        'error'
      );
    } finally {
      setDeleteLoading(false);
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
        loading={formLoading}
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
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            O'chirish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
