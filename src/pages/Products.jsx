import React, { useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import socket from '../socket';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import api from '../api/axios';

import ProductList from '../components/products/ProductList';
import ProductFormDialog from '../components/products/ProductFormDialog';
import ProductViewDialog from '../components/products/ProductViewDialog';

export default function Products() {
  const { enqueueSnackbar } = useSnackbar();
  
  // States
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Fetch products
  const fetchProducts = async (resetPage = false) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: resetPage ? 1 : pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      if (filters.category) params.append('category', filters.category);
      if (filters.subcategory) params.append('subcategory', filters.subcategory);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.inStock) params.append('inStock', filters.inStock);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/products?${params}`);
      setProducts(response.data.products || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        page: resetPage ? 1 : prev.page
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Mahsulotlarni yuklashda xatolik',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, pagination.limit, filters, searchTerm]);

  // Handlers
  const handleProductSuccess = async () => {
    await fetchProducts(true);
    setFormDialogOpen(false);
    setSelectedProduct(null);
    enqueueSnackbar('Muvaffaqiyatli bajarildi', { variant: 'success' });
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${productToDelete._id}`);
      enqueueSnackbar('Mahsulot muvaffaqiyatli o\'chirildi', { variant: 'success' });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Mahsulotni o\'chirishda xatolik',
        { variant: 'error' }
      );
    }
  };

  const handleOpenFormDialog = (product = null) => {
    setSelectedProduct(product);
    setFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleOpenViewDialog = (product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenFormDialog()}
        >
          Yangi mahsulot
        </Button>

        {/* Search */}
        <TextField
          size="small"
          placeholder="Qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Category filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Kategoriya</InputLabel>
          <Select
            name="category"
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            label="Kategoriya"
          >
            <MenuItem value="">Barchasi</MenuItem>
            {/* Add category options */}
          </Select>
        </FormControl>

        {/* Brand filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Brend</InputLabel>
          <Select
            name="brand"
            value={filters.brand}
            onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
            label="Brend"
          >
            <MenuItem value="">Barchasi</MenuItem>
            {/* Add brand options */}
          </Select>
        </FormControl>

        {/* Price range */}
        <TextField
          size="small"
          name="minPrice"
          label="Min narx"
          type="number"
          value={filters.minPrice}
          onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
          sx={{ width: 150 }}
        />
        <TextField
          size="small"
          name="maxPrice"
          label="Max narx"
          type="number"
          value={filters.maxPrice}
          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
          sx={{ width: 150 }}
        />

        {/* Stock filter */}
        <FormControlLabel
          control={
            <Checkbox
              name="inStock"
              checked={filters.inStock}
              onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
            />
          }
          label="Faqat mavjud"
        />

        {/* Sort */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Saralash</InputLabel>
          <Select
            name="sortBy"
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            label="Saralash"
          >
            <MenuItem value="createdAt">Qo'shilgan vaqti</MenuItem>
            <MenuItem value="name">Nomi</MenuItem>
            <MenuItem value="price">Narxi</MenuItem>
            <MenuItem value="stock">Miqdori</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Tartib</InputLabel>
          <Select
            name="sortOrder"
            value={filters.sortOrder}
            onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
            label="Tartib"
          >
            <MenuItem value="desc">Kamayish</MenuItem>
            <MenuItem value="asc">O'sish</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Product list */}
      <Box sx={{ width: '100%', p: 3 }}>
        <ProductList 
          products={products}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={(newLimit) => setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))}
          onProductDelete={handleOpenDeleteDialog}
          onProductSuccess={handleProductSuccess}
          enqueueSnackbar={enqueueSnackbar}
        />
      </Box>

      {/* View dialog */}
      <ProductViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        product={selectedProduct}
      />

      {/* Form dialog */}
      <ProductFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={handleProductSuccess}
      />

      {/* Delete dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Mahsulotni o'chirish</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {productToDelete?.name} mahsulotini o'chirishni tasdiqlaysizmi?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Bekor qilish
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            O'chirish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}