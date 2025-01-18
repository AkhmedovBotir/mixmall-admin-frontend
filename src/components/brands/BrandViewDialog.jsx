import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  IconButton,
  Box,
  Grid,
  Chip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const BrandViewDialog = ({
  open,
  brand,
  onClose,
}) => {
  if (!brand) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Faol';
      case 'inactive':
        return 'Faol emas';
      default:
        return status;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ backgroundColor: '#f5f5f5', pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
            Brend ma'lumotlari
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#1a237e',
              '&:hover': {
                backgroundColor: 'rgba(26, 35, 126, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ minHeight: 120 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Nomi
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {brand.name}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Tavsif
              </Typography>
              <Typography variant="body1">
                {brand.description || 'Tavsif mavjud emas'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Mahsulotlar soni
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {brand.productsCount || 0} ta
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Status
              </Typography>
              <Chip
                label={getStatusText(brand.status)}
                color={getStatusColor(brand.status)}
                size="small"
                sx={{ mt: 0.5, fontWeight: 500 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Yaratilgan sana
              </Typography>
              <Typography variant="body1">
                {new Date(brand.createdAt).toLocaleDateString()}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                O'zgartirilgan sana
              </Typography>
              <Typography variant="body1">
                {new Date(brand.updatedAt).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: '#1a237e',
            borderColor: '#1a237e',
            '&:hover': {
              borderColor: '#0d47a1',
              backgroundColor: 'rgba(26, 35, 126, 0.04)'
            }
          }}
        >
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BrandViewDialog;
