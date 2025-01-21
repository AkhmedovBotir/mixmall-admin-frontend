import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Stack,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

const INITIAL_FORM_STATE = {
  name: '',
  image: null,
  imagePreview: '',
  subcategories: []
};

const CategoryFormDialog = ({
  open,
  onClose,
  onSubmit,
  mode = 'add',
  category = null,
  loading = false
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  // Form ni tozalash
  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
  };

  // Formni yopish
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Kategoriya ma'lumotlarini formga yuklash
  useEffect(() => {
    if (open && mode === 'edit' && category) {
      setFormData({
        _id: category._id,
        name: category.name,
        status: category.status,
        image: null,
        imagePreview: category.image ? `https://adderapi.mixmall.uz${category.image}` : '',
        subcategories: category.subcategories || []
      });
    } else if (open && mode === 'add') {
      resetForm();
    }
  }, [open, mode, category]);

  // Rasm tanlash
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Rasm validatsiyasi
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Faqat rasm fayllarini yuklash mumkin'
        }));
        return;
      }

      // Rasm hajmi validatsiyasi (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Rasm hajmi 5MB dan oshmasligi kerak'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  // Subkategoriya qo'shish
  const handleAddSubcategory = () => {
    setFormData(prev => ({
      ...prev,
      subcategories: [
        ...prev.subcategories,
        { name: '', status: 'active' }
      ]
    }));
  };

  // Subkategoriyani o'zgartirish
  const handleSubcategoryChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.map((sub, i) =>
        i === index ? { ...sub, name: value } : sub
      )
    }));
  };

  // Subkategoriyani o'chirish
  const handleRemoveSubcategory = (index) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== index)
    }));
  };

  // Formni yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validatsiya
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Kategoriya nomi kiritilishi shart';
    }
    
    if (mode === 'add' && !formData.image) {
      newErrors.image = 'Rasm yuklash majburiy';
    }
    
    formData.subcategories.forEach((sub, index) => {
      if (!sub.name.trim()) {
        newErrors[`subcategory${index}`] = 'Subkategoriya nomi kiritilishi shart';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'add' ? 'Yangi kategoriya' : 'Kategoriyani tahrirlash'}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Kategoriya nomi */}
            <TextField
              label="Kategoriya nomi"
              fullWidth
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                setErrors(prev => ({ ...prev, name: '' }));
              }}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
              required
            />

            {/* Rasm yuklash */}
            <Box sx={{ mt: 3 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="category-image-input"
              />
              <label htmlFor="category-image-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                >
                  Rasm yuklash
                </Button>
              </label>
              {formData.imagePreview && (
                <Box sx={{ mt: 2, position: 'relative' }}>
                  <img
                    src={formData.imagePreview}
                    alt="Kategoriya rasmi"
                    style={{ maxWidth: '100%', maxHeight: 200 }}
                  />
                </Box>
              )}
            </Box>

            {/* Subkategoriyalar */}
            <Box sx={{ mt: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  Subkategoriyalar
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddSubcategory}
                  disabled={loading}
                >
                  Qo'shish
                </Button>
              </Stack>

              {formData.subcategories.map((sub, index) => (
                <Box
                  key={sub._id || index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}
                >
                  <TextField
                    label={`Subkategoriya ${index + 1}`}
                    fullWidth
                    size="small"
                    value={sub.name}
                    onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                    error={!!errors[`subcategory${index}`]}
                    helperText={errors[`subcategory${index}`]}
                    disabled={loading}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveSubcategory(index)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {mode === 'add' ? "Qo'shish" : 'Saqlash'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryFormDialog;
