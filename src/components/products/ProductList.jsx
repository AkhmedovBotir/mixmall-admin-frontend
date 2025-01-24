import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { SnackbarProvider } from 'notistack';
import socket from '../../socket';
import ProductFormDialog from './ProductFormDialog';

function ProductList({ 
  products: initialProducts, 
  loading: initialLoading,
  pagination,
  onPageChange,
  onLimitChange,
  onProductDelete,
  onProductSuccess,
  enqueueSnackbar 
}) {
  // Local states
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(initialLoading);
  const [page, setPage] = useState(pagination?.page ? pagination.page - 1 : 0);
  const [rowsPerPage, setRowsPerPage] = useState(pagination?.limit || 10);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setProducts(initialProducts || []);
  }, [initialProducts]);

  useEffect(() => {
    setLoading(initialLoading);
  }, [initialLoading]);

  // Socket events
  useEffect(() => {
    const setupSocketEvents = () => {
      socket.on('product:created', (data) => {
        console.log('Yangi mahsulot:', data);
        if (onProductSuccess) {
          onProductSuccess();
        }
      });

      socket.on('product:updated', (data) => {
        console.log('Mahsulot yangilandi:', data);
        if (onProductSuccess) {
          onProductSuccess();
        }
      });

      socket.on('product:deleted', (data) => {
        console.log('Mahsulot o\'chirildi:', data);
        if (onProductSuccess) {
          onProductSuccess();
        }
      });
    };

    setupSocketEvents();

    return () => {
      socket.off('product:created');
      socket.off('product:updated');
      socket.off('product:deleted');
    };
  }, [onProductSuccess]);

  // Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    if (onPageChange) {
      onPageChange(newPage + 1);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(0);
    if (onLimitChange) {
      onLimitChange(newLimit);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (product) => {
    if (onProductDelete) {
      onProductDelete(product);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Mahsulotlar topilmadi</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
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
          count={pagination?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Sahifadagi mahsulotlar:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} dan ${count !== -1 ? count : `${to} dan ko'proq`}`
          }
        />
      </TableContainer>

      {/* O'zgartirish modali */}
      <ProductFormDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={onProductSuccess}
        enqueueSnackbar={enqueueSnackbar}
      />
    </Box>
  );
}

export default ProductList;
