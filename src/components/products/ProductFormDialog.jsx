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
  Typography
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ProductFormDialog = ({ open, onClose, product }) => {
  const initialFormData = {
    name: '',
    price: '',
    stock: '',
    discount_percent: 0,
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
  const [discountPrice, setDiscountPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        stock: product.stock || '',
        discount_percent: product.discount_percent || 0,
        brand: product.brand?._id || product.brand || '',
      });
      setDescription(product.description || '');
      setSelectedCategories(product.categories?.map(cat => cat._id || cat) || []);
      setExistingImages(product.images || []);
      
      if (product.subcategories?.length) {
        const subIds = product.subcategories.map(sub => sub._id || sub);
        setSelectedSubcategories(subIds);
      }
    }
  }, [product]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [brandsRes, categoriesRes] = await Promise.all([
          axios.get('https://adderapi.mixmall.uz/api/brands', { headers }),
          axios.get('https://adderapi.mixmall.uz/api/categories', { headers })
        ]);

        if (brandsRes.data.status === 'success') {
          setBrands(brandsRes.data.data || []);
        }

        if (categoriesRes.data.status === 'success') {
          const cats = categoriesRes.data.data || [];
          setCategories(cats);
          
          // Agar product mavjud bo'lsa va kategoriyalari bo'lsa
          if (product?.categories?.length) {
            const selectedCats = cats.filter(cat => 
              product.categories.some(pc => (pc._id || pc) === cat._id)
            );
            const allSubcategories = selectedCats.reduce((acc, cat) => {
              return [...acc, ...(cat.subcategories || [])];
            }, []);
            setSubcategories(allSubcategories);
          }
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
  }, [product]);

  useEffect(() => {
    // Chegirma narxini hisoblash
    const price = Number(formData.price) || 0;
    const discount = Number(formData.discount_percent) || 0;
    const discounted = price - (price * discount / 100);
    setDiscountPrice(Math.round(discounted));
  }, [formData.price, formData.discount_percent]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let newValue = value;

    // Raqamli maydonlar uchun validatsiya
    if (name === 'price' || name === 'stock' || name === 'discount_percent') {
      newValue = value === '' ? '' : Number(value);
      if (name === 'discount_percent' && (newValue < 0 || newValue > 100)) {
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleCategoryChange = (event) => {
    const categoryIds = event.target.value;
    setSelectedCategories(categoryIds);
    setSelectedSubcategories([]); // Reset subcategories

    // Tanlangan kategoriyalardan subkategoriyalarni olish
    const selectedCats = categories.filter(cat => categoryIds.includes(cat._id));
    const allSubcategories = selectedCats.reduce((acc, cat) => {
      return [...acc, ...(cat.subcategories || [])];
    }, []);

    // Dublikatlarni olib tashlash
    const uniqueSubcategories = Array.from(new Set(allSubcategories.map(sub => sub._id)))
      .map(id => allSubcategories.find(sub => sub._id === id));

    setSubcategories(uniqueSubcategories);
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

    // Discount validation
    if (formData.discount_percent && (Number(formData.discount_percent) < 0 || Number(formData.discount_percent) > 100)) {
      newErrors.discount_percent = 'Chegirma foizi 0 dan 100 gacha bo\'lishi kerak';
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
      const formDataToSend = new FormData();
      
      // Asosiy ma'lumotlar
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', description);
      formDataToSend.append('price', Number(formData.price));
      formDataToSend.append('stock', Number(formData.stock));
      formDataToSend.append('discount_percent', Number(formData.discount_percent || 0));
      formDataToSend.append('brand', formData.brand);
      
      // Kategoriya va subkategoriyalar
      selectedCategories.forEach(catId => {
        formDataToSend.append('categories[]', catId);
      });
      
      // Subkategoriyalar obyekt ko'rinishida yuboriladi
      const subcategoriesData = selectedSubcategories.map(subId => {
        const subcategory = subcategories.find(sub => sub._id === subId);
        if (!subcategory) return null;
        return {
          _id: subcategory._id,
          name: subcategory.name,
          status: subcategory.status
        };
      }).filter(Boolean);

      // Debug: Subkategoriyalar ma'lumotini ko'rish
      console.log('Subcategories data:', subcategoriesData);
      
      formDataToSend.append('subcategories', JSON.stringify(subcategoriesData));

      // Debug: FormData tarkibini ko'rish
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Yangi rasmlar
      if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          formDataToSend.append('images', file);
        });
      }

      // O'chiriladigan rasmlar
      if (imagesToDelete.length > 0) {
        formDataToSend.append('deleteImages', JSON.stringify(imagesToDelete));
      }

      const token = localStorage.getItem('token');
      const url = product 
        ? `https://adderapi.mixmall.uz/api/products/${product._id}`
        : 'https://adderapi.mixmall.uz/api/products';
      
      const method = product ? 'put' : 'post';
      
      const response = await axios({
        method,
        url,
        data: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Debug: API javobini ko'rish
      console.log('API response:', response.data);

      if (response.data.status === 'success') {
        onClose();
        window.location.reload();
      } else {
        throw new Error(response.data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Submit error:', error);
      console.log('Error response:', error.response?.data);
      
      let errorMessage = 'Xatolik yuz berdi';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
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
              label="Chegirma foizi"
              name="discount_percent"
              type="number"
              value={formData.discount_percent || ''}
              onChange={handleChange}
              error={!!errors.discount_percent}
              helperText={errors.discount_percent}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
            />
          </Grid>

          {formData.discount_percent > 0 && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Chegirma narxi"
                name="discount_price"
                type="number"
                value={discountPrice || ''}
                onChange={(e) => {
                  const newDiscountPrice = Number(e.target.value);
                  if (newDiscountPrice <= 0) return;
                  
                  // Yangi chegirma foizini hisoblash
                  const originalPrice = Number(formData.price);
                  if (originalPrice <= 0) return;
                  
                  const newDiscountPercent = Math.round(((originalPrice - newDiscountPrice) / originalPrice) * 100);
                  if (newDiscountPercent < 0 || newDiscountPercent > 100) return;
                  
                  setFormData(prev => ({
                    ...prev,
                    discount_percent: newDiscountPercent
                  }));
                  setDiscountPrice(newDiscountPrice);
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">so'm</InputAdornment>,
                  startAdornment: formData.price ? (
                    <InputAdornment position="start">
                      <FormHelperText 
                        sx={{ textDecoration: 'line-through' }}
                      >
                        {Number(formData.price).toLocaleString()}
                      </FormHelperText>
                    </InputAdornment>
                  ) : null
                }}
              />
            </Grid>
          )}
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
              <FormHelperText error={errors.description ? "true" : undefined}>
                {errors.description}
              </FormHelperText>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
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
                          src={`https://adderapi.mixmall.uz${brand.logo}`}
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
                <FormHelperText error={errors.brand ? "true" : undefined}>
                  {errors.brand}
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.categories}>
              <InputLabel>Kategoriyalar</InputLabel>
              <Select
                multiple
                value={selectedCategories || []}
                onChange={handleCategoryChange}
                label="Kategoriyalar"
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
                          src={`https://adderapi.mixmall.uz${category.image}`}
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
                <FormHelperText error={errors.categories ? "true" : undefined}>
                  {errors.categories}
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          {subcategories.length > 0 && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.subcategories}>
                <InputLabel>Subkategoriyalar</InputLabel>
                <Select
                  multiple
                  value={selectedSubcategories || []}
                  onChange={(e) => setSelectedSubcategories(e.target.value)}
                  label="Subkategoriyalar"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={subcategories.find(sub => sub._id === value)?.name}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {subcategories.map((subcategory) => (
                    <MenuItem key={subcategory._id} value={subcategory._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {subcategory.image && (
                          <Box
                            component="img"
                            src={`https://adderapi.mixmall.uz${subcategory.image}`}
                            alt={subcategory.name}
                            sx={{ width: 24, height: 24, objectFit: 'contain' }}
                          />
                        )}
                        {subcategory.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.subcategories && (
                  <FormHelperText error={errors.subcategories ? "true" : undefined}>
                    {errors.subcategories}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}
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
                          src={`https://adderapi.mixmall.uz${image}`}
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
