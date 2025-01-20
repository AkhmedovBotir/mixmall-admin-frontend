import React, { useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { socket } from '../socket';
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

  // Mahsulotlarni yuklash
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Query parametrlarini tayyorlash
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      // Filtrlash parametrlarini qo'shish
      if (filters.category) params.append('category', filters.category);
      if (filters.subcategory) params.append('subcategory', filters.subcategory);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.inStock) params.append('inStock', filters.inStock);
      if (searchTerm) params.append('search', searchTerm);

      // API so'rovi
      const response = await api.get(`/products?${params}`);

      // Ma'lumotlarni saqlash
      setProducts(response.data.products);
      setPagination({
        ...pagination,
        total: response.data.total
      });
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

  // Filtrlar o'zgarganda mahsulotlarni qayta yuklash
  useEffect(() => {
    fetchProducts();
  }, [pagination.page, filters, searchTerm]);

  // Socket eventlarni tinglash
  useEffect(() => {
    // Socket eventlarni tinglash
    socket.on('product:created', (data) => {
      console.log('Yangi mahsulot qo\'shildi:', data);
      fetchProducts();
    });

    socket.on('product:updated', (data) => {
      console.log('Mahsulot yangilandi:', data);
      fetchProducts();
    });

    socket.on('product:deleted', (data) => {
      console.log('Mahsulot o\'chirildi:', data);
      setProducts(prevProducts => 
        prevProducts.filter(product => product._id !== data._id)
      );
      enqueueSnackbar(`${data.name} mahsuloti o'chirildi`, { 
        variant: 'info'
      });
    });

    socket.on('product:stock', (data) => {
      console.log('Mahsulot skladi yangilandi:', data);
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product._id === data._id 
            ? { ...product, stock: data.stock }
            : product
        )
      );
    });

    // Cleanup
    return () => {
      socket.off('product:created');
      socket.off('product:updated');
      socket.off('product:deleted');
      socket.off('product:stock');
    };
  }, []);

  // Dialog handlers
  const handleOpenViewDialog = (product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setSelectedProduct(null);
    setViewDialogOpen(false);
  };

  const handleOpenFormDialog = (product = null) => {
    setSelectedProduct(product);
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setSelectedProduct(null);
    setFormDialogOpen(false);
  };

  const handleOpenDeleteDialog = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setProductToDelete(null);
    setDeleteDialogOpen(false);
  };

  // Mahsulotni o'chirish
  const handleDelete = async () => {
    try {
      setLoading(true);

      if (!productToDelete?._id) {
        throw new Error('Mahsulot ID si topilmadi');
      }

      // O'chirish so'rovi
      const response = await api.delete(`/products/${productToDelete._id}`);

      // Debug log
      console.log('Delete response:', response);

      // Muvaffaqiyatli
      handleCloseDeleteDialog();
      enqueueSnackbar('Mahsulot muvaffaqiyatli o\'chirildi', { 
        variant: 'success' 
      });

      // Local state dan o'chirish
      setProducts(prevProducts => 
        prevProducts.filter(product => product._id !== productToDelete._id)
      );

    } catch (error) {
      console.error('Error deleting product:', error);
      enqueueSnackbar(
        error.response?.data?.message || error.message || 'Mahsulotni o\'chirishda xatolik',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter handlers
  const handleFilterChange = (event) => {
    const { name, value, checked } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'inStock' ? checked : value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Search handler
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Pagination handler
  const handlePageChange = (event, newPage) => {
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
          onChange={handleSearch}
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
            onChange={handleFilterChange}
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
            onChange={handleFilterChange}
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
          onChange={handleFilterChange}
          sx={{ width: 150 }}
        />
        <TextField
          size="small"
          name="maxPrice"
          label="Max narx"
          type="number"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          sx={{ width: 150 }}
        />

        {/* Stock filter */}
        <FormControlLabel
          control={
            <Checkbox
              name="inStock"
              checked={filters.inStock}
              onChange={handleFilterChange}
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
            onChange={handleFilterChange}
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
            onChange={handleFilterChange}
            label="Tartib"
          >
            <MenuItem value="desc">Kamayish</MenuItem>
            <MenuItem value="asc">O'sish</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Product list */}
      <ProductList
        products={products}
        loading={loading}
        onView={handleOpenViewDialog}
        onEdit={handleOpenFormDialog}
        onDelete={handleOpenDeleteDialog}
        pagination={{
          page: pagination.page,
          total: pagination.total,
          limit: pagination.limit,
          onChange: handlePageChange
        }}
      />

      {/* View dialog */}
      <ProductViewDialog
        open={viewDialogOpen}
        product={selectedProduct}
        onClose={handleCloseViewDialog}
        onEdit={() => {
          handleCloseViewDialog();
          handleOpenFormDialog(selectedProduct);
        }}
      />

      {/* Form dialog */}
      <ProductFormDialog
        open={formDialogOpen}
        product={selectedProduct}
        onClose={handleCloseFormDialog}
        onSuccess={() => {
          handleCloseFormDialog();
          fetchProducts();
        }}
      />

      {/* Delete dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>
          Mahsulotni o'chirish
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Haqiqatan ham "{productToDelete?.name}" mahsulotini o'chirmoqchimisiz?
            <br />
            Bu amalni ortga qaytarib bo'lmaydi.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            Bekor qilish
          </Button>
          <LoadingButton
            onClick={handleDelete}
            loading={loading}
            color="error"
            variant="contained"
          >
            O'chirish
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}