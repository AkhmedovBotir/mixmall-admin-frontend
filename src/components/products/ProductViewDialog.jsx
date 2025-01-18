import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ProductViewDialog = ({ open, onClose, product }) => {
  if (!product) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        {product.name}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Rasmlar */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {product.images?.map((image, index) => (
                <Paper
                  key={index}
                  elevation={2}
                  sx={{
                    width: 200,
                    height: 200,
                    overflow: 'hidden',
                    borderRadius: 2
                  }}
                >
                  <img
                    src={`https://adderapi.mixmall.uz${image}`}
                    alt={`${product.name} ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Paper>
              ))}
            </Box>
          </Grid>

          {/* Asosiy ma'lumotlar */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Narx:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {product.discount_percent > 0 ? (
                <>
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {product.discount_price?.toLocaleString()} so'm
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {product.price?.toLocaleString()} so'm
                  </Typography>
                  <Chip
                    label={`-${product.discount_percent}%`}
                    color="error"
                    size="small"
                  />
                </>
              ) : (
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                >
                  {product.price?.toLocaleString()} so'm
                </Typography>
              )}
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Ombordagi soni:
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={product.inStock ? 'Mavjud' : 'Mavjud emas'}
                color={product.inStock ? 'success' : 'error'}
                sx={{ fontWeight: 'medium' }}
              />
              <Typography variant="body1" color="text.secondary">
                {product.stock} dona
              </Typography>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Brand:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {product.brand?.logo && (
                <Box
                  component="img"
                  src={`https://adderapi.mixmall.uz${product.brand.logo}`}
                  alt={product.brand?.name}
                  sx={{ width: 24, height: 24, objectFit: 'contain' }}
                />
              )}
              <Typography>{product.brand?.name}</Typography>
            </Box>
          </Grid>

          {/* Qo'shimcha ma'lumotlar */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Kategoriyalar:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {product.categories?.map((category) => (
                <Chip
                  key={category._id}
                  label={category.name}
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                  avatar={
                    category.image ? (
                      <Box
                        component="img"
                        src={`https://adderapi.mixmall.uz${category.image}`}
                        alt={category.name}
                        sx={{ width: 24, height: 24, objectFit: 'contain' }}
                      />
                    ) : null
                  }
                />
              ))}
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Subkategoriyalar:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {product.subcategories?.map((subcategory) => (
                <Chip
                  key={subcategory._id}
                  label={subcategory.name}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Status:
            </Typography>
            <Chip
              label={product.status === 'active' ? 'Faol' : 'Nofaol'}
              color={product.status === 'active' ? 'success' : 'default'}
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Tavsif */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Tavsif:
            </Typography>
            <Box sx={{ mt: 1 }}>
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </Box>
          </Grid>

          {/* Vaqt */}
          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Yaratilgan vaqt:{' '}
                {new Date(product.createdAt).toLocaleString('uz-UZ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                O'zgartirilgan vaqt:{' '}
                {new Date(product.updatedAt).toLocaleString('uz-UZ')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ProductViewDialog;
