import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from 'axios';
import ProductViewDialog from './ProductViewDialog';
import ProductFormDialog from './ProductFormDialog';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    inStock: 'all',
    sortBy: 'price',
    sortOrder: 'desc'
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        inStock: filters.inStock === 'true' ? true : undefined
      };

      const response = await axios.get('https://adderapi.mixmall.uz/api/products', { params });
      
      if (response.data?.data?.products && Array.isArray(response.data.data.products)) {
        setProducts(response.data.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Mahsulotlarni yuklashda xatolik:', error);
      setError('Mahsulotlarni yuklashda xatolik yuz berdi');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://adderapi.mixmall.uz/api/products/${productToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // O'chirilgan mahsulotni ro'yxatdan olib tashlash
      setProducts(products.filter(p => p._id !== productToDelete._id));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      
      // Muvaffaqiyatli xabar ko'rsatish
      // enqueueSnackbar('Mahsulot muvaffaqiyatli o'chirildi', { variant: 'success' });
    } catch (error) {
      console.error('Delete error:', error);
      let errorMessage = 'Mahsulotni o\'chirishda xatolik yuz berdi';
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Avtorizatsiyadan o\'tilmagan';
            break;
          case 403:
            errorMessage = 'Bu amalni bajarish uchun ruxsat yo\'q';
            break;
          case 404:
            errorMessage = 'Mahsulot topilmadi';
            break;
          default:
            errorMessage = error.response.data.message || errorMessage;
        }
      }
      
      // enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <div>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Minimal narx"
            type="number"
            value={filters.minPrice}
            onChange={handleFilterChange('minPrice')}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Maksimal narx"
            type="number"
            value={filters.maxPrice}
            onChange={handleFilterChange('maxPrice')}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Mavjudligi</InputLabel>
            <Select
              value={filters.inStock}
              onChange={handleFilterChange('inStock')}
              label="Mavjudligi"
            >
              <MenuItem value="all">Barchasi</MenuItem>
              <MenuItem value="true">Mavjud</MenuItem>
              <MenuItem value="false">Mavjud emas</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Saralash</InputLabel>
            <Select
              value={filters.sortBy}
              onChange={handleFilterChange('sortBy')}
              label="Saralash"
            >
              <MenuItem value="price">Narx</MenuItem>
              <MenuItem value="name">Nomi</MenuItem>
              <MenuItem value="createdAt">Yaratilgan vaqti</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Tartib</InputLabel>
            <Select
              value={filters.sortOrder}
              onChange={handleFilterChange('sortOrder')}
              label="Tartib"
            >
              <MenuItem value="asc">O'sish bo'yicha</MenuItem>
              <MenuItem value="desc">Kamayish bo'yicha</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {products.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Mahsulotlar topilmadi</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rasm</TableCell>
                <TableCell>Nomi</TableCell>
                <TableCell>Narx</TableCell>
                <TableCell>Soni</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    {product.images?.[0] && (
                      <Box
                        component="img"
                        src={`https://adderapi.mixmall.uz${product.images[0]}`}
                        alt={product.name}
                        sx={{ width: 50, height: 50, objectFit: 'cover' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    {product.discount_percent > 0 ? (
                      <Box>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                          {(product.price * (1 - product.discount_percent / 100)).toLocaleString()} so'm
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through', display: 'block' }}
                        >
                          {product.price.toLocaleString()} so'm
                        </Typography>
                      </Box>
                    ) : (
                      <Typography>
                        {product.price.toLocaleString()} so'm
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.brand?.name}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleView(product)}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEdit(product)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(product)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={-1}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      )}

      <ProductViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        product={selectedProduct}
      />

      <ProductFormDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          fetchProducts();
        }}
        product={selectedProduct}
      />

      {/* O'chirish tasdiqlash dialogi */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Mahsulotni o'chirish</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {productToDelete?.name} mahsulotini o'chirishni tasdiqlaysizmi?
            Bu amalni ortga qaytarib bo'lmaydi.
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
    </div>
  );
};

export default ProductList;
