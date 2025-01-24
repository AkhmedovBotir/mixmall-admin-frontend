import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  FormHelperText,
  Chip,
  InputAdornment,
  Typography,
  OutlinedInput
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ProductFormDialog = ({ open, onClose, product, onSuccess, enqueueSnackbar }) => {
  const initialFormData = {
    name: '',
    price: '',
    stock: '',
    brand: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [errors, setErrors] = useState({});
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        stock: product.stock || '',
        brand: product.brand?._id || product.brand || '',
      });
      setDescription(product.description || '');
      
      // Kategoriyalarni o'rnatish
      const categoryIds = product.categories?.map(cat => cat._id || cat) || [];
      setSelectedCategories(categoryIds);
      
      // Subkategoriyalarni o'rnatish
      if (product.subcategories?.length) {
        const subIds = product.subcategories.map(sub => sub._id || sub);
        setSelectedSubcategories(subIds);
      }

      // Mavjud rasmlarni o'rnatish
      if (product.images?.length) {
        setExistingImages(product.images);
      }
    }
  }, [product]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          axios.get('https://adderapi.mixmall.uz/api/brands', {
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }),
          axios.get('https://adderapi.mixmall.uz/api/categories', {
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          })
        ]);

        if (brandsRes.data.data) {
          setBrands(brandsRes.data.data);
        }

        if (categoriesRes.data.data) {
          const cats = categoriesRes.data.data;
          setCategories(cats);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        let errorMessage = 'Ma\'lumotlarni yuklashda xatolik';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        setErrors(prev => ({
          ...prev,
          fetch: errorMessage
        }));
        
        setBrands([]);
        setCategories([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const selectedCats = categories.filter(cat => selectedCategories.includes(cat._id));
        const allSubcategories = selectedCats.reduce((acc, cat) => {
          const subcats = cat.subcategories || [];
          return [...acc, ...subcats.map(sub => ({
            ...sub,
            _id: sub._id || `${cat._id}_${sub.name}`,
            category_id: cat._id,
            name: sub.name || sub // Agar sub string bo'lsa
          }))];
        }, []);
        setSubcategories(allSubcategories);
      } catch (error) {
        console.error('Subkategoriyalarni olishda xatolik:', error);
        if (typeof enqueueSnackbar === 'function') {
          enqueueSnackbar('Subkategoriyalarni olishda xatolik yuz berdi', { 
            variant: 'error' 
          });
        }
      }
    };

    if (selectedCategories.length > 0) {
      fetchSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [selectedCategories, categories]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let newValue = value;

    // Raqamli maydonlar uchun validatsiya
    if (name === 'price' || name === 'stock') {
      newValue = value === '' ? '' : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const getAvailableSubcategories = () => {
    if (!selectedCategories.length) return [];
    
    return subcategories.filter(subcat => 
      selectedCategories.includes(subcat.category)
    );
  };

  const handleSubcategoryChange = (event) => {
    const selectedIds = event.target.value;
    setSelectedSubcategories(selectedIds);
    setErrors(prev => ({ ...prev, subcategories: '' }));
  };

  const handleCategoryChange = (event) => {
    const categoryIds = event.target.value;
    setSelectedCategories(categoryIds);
    setSelectedSubcategories([]); // Reset subcategories
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Fayllarni saqlash
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Preview URL larni yaratish
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveNewImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => {
      // URL ni tozalash
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveExistingImage = (index) => {
    const imageToDelete = existingImages[index];
    setImagesToDelete(prev => [...prev, imageToDelete]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Mahsulot nomi kiritilishi shart';
    }

    // Description validation
    if (!description?.trim()) {
      newErrors.description = 'Mahsulot tavsifi kiritilishi shart';
    }

    // Price validation
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = 'Narx 0 dan katta bo\'lishi kerak';
    }

    // Stock validation
    if (!formData.stock || Number(formData.stock) < 0) {
      newErrors.stock = 'Mahsulot soni 0 dan kichik bo\'lishi mumkin emas';
    }

    // Brand validation
    if (!formData.brand) {
      newErrors.brand = 'Brand tanlanishi shart';
    }

    // Categories validation
    if (!selectedCategories.length) {
      newErrors.categories = 'Kamida bitta kategoriya tanlanishi shart';
    }

    // Subcategories validation
    if (!selectedSubcategories.length) {
      newErrors.subcategories = 'Kamida bitta subkategoriya tanlanishi shart';
    }

    // Images validation
    if (!product && selectedFiles.length === 0) {
      newErrors.images = 'Kamida bitta rasm yuklash shart';
    }

    if (selectedFiles.length > 5) {
      newErrors.images = 'Maksimal 5 ta rasm yuklash mumkin';
    }

    selectedFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        newErrors.images = 'Rasm hajmi 5MB dan oshmasligi kerak';
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        newErrors.images = 'Faqat jpeg, jpg, png, webp formatdagi rasmlar qabul qilinadi';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Form validatsiyasi
      const validationErrors = {};
      if (!formData.name) validationErrors.name = "Nom kiritish majburiy";
      if (!formData.price) validationErrors.price = "Narx kiritish majburiy";
      if (!description) validationErrors.description = "Tavsif kiritish majburiy";
      if (!formData.brand) validationErrors.brand = "Brand tanlash majburiy";
      if (!selectedCategories.length) validationErrors.categories = "Kamida bitta kategoriya tanlanishi shart";
      if (!selectedSubcategories.length) validationErrors.subcategories = "Kamida bitta subkategoriya tanlanishi shart";
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // FormData yaratish
      const formDataToSend = new FormData();
      
      // Asosiy ma'lumotlarni qo'shish
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock || 0);
      formDataToSend.append('brand', formData.brand);
      
      // Kategoriyalarni qo'shish
      formDataToSend.append('categories', JSON.stringify(selectedCategories));
      
      // Subkategoriyalarni qo'shish
      const formattedSubcategories = selectedSubcategories.map(subcatId => {
        const subcat = subcategories.find(s => s._id === subcatId);
        if (!subcat) return null;
        
        return {
          _id: subcat._id,
          name: subcat.name,
          status: "active"
        };
      }).filter(Boolean);

      // Subkategoriyalar majburiy
      if (formattedSubcategories.length === 0) {
        setErrors(prev => ({
          ...prev,
          subcategories: "Kamida bitta subkategoriya tanlanishi shart"
        }));
        setLoading(false);
        return;
      }

      formDataToSend.append('subcategories', JSON.stringify(formattedSubcategories));

      // Attributelarni qo'shish (bo'sh bo'lsa ham)
      formDataToSend.append('attributes', JSON.stringify([{
        name: "Rang",
        value: "Qizil"
      }]));

      // Yangi rasmlarni qo'shish
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file, index) => {
          if (index < 5) { // Maksimum 5 ta rasm
            formDataToSend.append('images', file);
          }
        });
      }

      // O'chirilgan rasmlarni qo'shish
      if (imagesToDelete.length > 0) {
        formDataToSend.append('deleteImages', JSON.stringify(imagesToDelete));
      }

      // Chegirmani 0 qilib yuboramiz
      formDataToSend.append('discount_percent', 0);

      console.log('Yuborilayotgan ma\'lumotlar:', {
        name: formData.name,
        description,
        price: formData.price,
        stock: formData.stock || 0,
        brand: formData.brand,
        categories: selectedCategories,
        subcategories: formattedSubcategories,
        images: selectedFiles.length
      });

      const url = product ? `https://adderapi.mixmall.uz/api/products/${product._id}` : 'https://adderapi.mixmall.uz/api/products';
      const method = product ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: formDataToSend,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      console.log('Server response:', response);

      if (response.status === 200 || response.status === 201) {
        try {
          // 1. Snackbar xabarini ko'rsatish
          if (typeof enqueueSnackbar === 'function') {
            enqueueSnackbar(product ? 'Mahsulot muvaffaqiyatli yangilandi' : 'Mahsulot muvaffaqiyatli qo\'shildi', {
              variant: 'success',
              autoHideDuration: 3000
            });
          }

          // 2. Formani tozalash
          setFormData(initialFormData);
          setDescription('');
          setSelectedCategories([]);
          setSelectedSubcategories([]);
          setSelectedFiles([]);
          setPreviewImages([]);
          setExistingImages([]);
          setImagesToDelete([]);
          setErrors({});

          // 3. onSuccess callback ni chaqirish
          if (typeof onSuccess === 'function') {
            // Modal yopilishidan oldin callback chaqirish
            await onSuccess();
          }

          // 4. Modalni yopish
          if (typeof onClose === 'function') {
            onClose();
          }
        } catch (error) {
          console.error('Success handling error:', error);
          if (enqueueSnackbar) {
            enqueueSnackbar('Ma\'lumotlarni qayta yuklashda xatolik', {
              variant: 'error',
              autoHideDuration: 3000
            });
          }
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message || "Xatolik yuz berdi";
      
      if (enqueueSnackbar) {
        enqueueSnackbar(errorMessage, { 
          variant: 'error',
          autoHideDuration: 3000
        });
      }
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (errorMessage.includes('subkategoriya')) {
        setErrors(prev => ({
          ...prev,
          subcategories: errorMessage
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle>
        {product ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nomi"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Narx"
              name="price"
              type="number"
              value={formData.price || ''}
              onChange={handleChange}
              error={!!errors.price}
              helperText={errors.price}
              InputProps={{
                endAdornment: <InputAdornment position="end">so'm</InputAdornment>
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ombordagi soni"
              name="stock"
              type="number"
              value={formData.stock || ''}
              onChange={handleChange}
              error={!!errors.stock}
              helperText={errors.stock}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.brand}>
              <InputLabel>Brand</InputLabel>
              <Select
                name="brand"
                value={formData.brand || ''}
                onChange={handleChange}
                label="Brand"
              >
                {brands.map((brand) => (
                  <MenuItem key={brand._id} value={brand._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {brand.logo && (
                        <Box
                          component="img"
                          src={brand.logo.startsWith('http') ? brand.logo : `https://adderapi.mixmall.uz${brand.logo}`}
                          alt={brand.name}
                          sx={{ width: 24, height: 24, objectFit: 'contain' }}
                        />
                      )}
                      {brand.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.brand && (
                <FormHelperText error>
                  {errors.brand}
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <ReactQuill
              theme="snow"
              value={description || ''}
              onChange={(value) => setDescription(value)}
              placeholder="Mahsulot tavsifi..."
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['clean']
                ]
              }}
              style={{ height: '200px', marginBottom: '50px' }}
            />
            {errors.description && (
              <FormHelperText error={Boolean(errors.description)}>
                {errors.description}
              </FormHelperText>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(errors.categories)}>
              <InputLabel>Kategoriyalar</InputLabel>
              <Select
                multiple
                value={selectedCategories}
                onChange={handleCategoryChange}
                input={<OutlinedInput label="Kategoriyalar" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={categories.find(cat => cat._id === value)?.name}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {category.image && (
                        <Box
                          component="img"
                          src={category.image.startsWith('http') ? category.image : `https://adderapi.mixmall.uz${category.image}`}
                          alt={category.name}
                          sx={{ width: 24, height: 24, objectFit: 'contain' }}
                        />
                      )}
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.categories && (
                <FormHelperText error>
                  {errors.categories}
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.subcategories}>
              <InputLabel>Subkategoriyalar</InputLabel>
              <Select
                multiple
                value={selectedSubcategories}
                onChange={handleSubcategoryChange}
                label="Subkategoriyalar"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const subcat = subcategories.find(sub => sub._id === value);
                      return (
                        <Chip
                          key={value}
                          label={subcat?.name || value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
                disabled={selectedCategories.length === 0}
              >
                {subcategories.map((subcategory) => (
                  <MenuItem key={subcategory._id} value={subcategory._id}>
                    {subcategory.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.subcategories && (
                <FormHelperText error>
                  {errors.subcategories}
                </FormHelperText>
              )}
              {selectedCategories.length === 0 && (
                <FormHelperText>
                  Avval kategoriya tanlang
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            {errors.submit && (
              <FormHelperText error={errors.submit ? "true" : undefined}>
                {errors.submit}
              </FormHelperText>
            )}
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Rasmlarni yuklash
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </Button>
            {errors.images && (
              <FormHelperText error={errors.images ? "true" : undefined}>
                {errors.images}
              </FormHelperText>
            )}
            
            {/* Barcha rasmlar */}
            {(previewImages.length > 0 || existingImages.length > 0) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Mahsulot rasmlari:
                </Typography>
                <Grid container spacing={1}>
                  {/* Mavjud rasmlar */}
                  {existingImages.map((image, index) => (
                    <Grid item key={`existing-${index}`}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: 100,
                          height: 100,
                        }}
                      >
                        <img
                          src={image.startsWith('http') ? image : `https://adderapi.mixmall.uz${image}`}
                          alt={`Image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' }
                          }}
                          onClick={() => handleRemoveExistingImage(index)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                  
                  {/* Yangi tanlangan rasmlar */}
                  {previewImages.map((preview, index) => (
                    <Grid item key={`preview-${index}`}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: 100,
                          height: 100,
                        }}
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' }
                          }}
                          onClick={() => handleRemoveNewImage(index)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Bekor qilish</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {product ? 'Saqlash' : 'Qo\'shish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormDialog;
