import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  DirectionsCar as DirectionsCarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'error';
    case 'busy':
      return 'warning';
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
    case 'busy':
      return 'Band';
    default:
      return status;
  }
};

const CourierViewDialog = ({
  open,
  onClose,
  courier,
}) => {
  if (!courier) return null;

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
            Kuryer ma'lumotlari
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
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <PersonIcon sx={{ color: '#1a237e' }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {courier?.firstName} {courier?.lastName}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <PhoneIcon sx={{ color: '#1a237e' }} />
              <Typography variant="body1">
                {courier?.phoneNumber || '-'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <DirectionsCarIcon sx={{ color: '#1a237e' }} />
              <Box>
                <Typography variant="body1">
                  Transport: {courier?.vehicle || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Raqami: {courier?.vehicleNumber || '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              <Chip
                label={getStatusText(courier?.status)}
                color={getStatusColor(courier?.status)}
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Ro'yxatdan o'tgan sana: {courier?.createdAt ? format(new Date(courier.createdAt), 'dd.MM.yyyy') : '-'}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#1a237e',
            '&:hover': {
              backgroundColor: 'rgba(26, 35, 126, 0.1)'
            }
          }}
        >
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourierViewDialog;
