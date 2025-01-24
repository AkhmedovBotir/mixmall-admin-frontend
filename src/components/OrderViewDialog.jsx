import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import OrderCourierDialog from './OrderCourierDialog';

const OrderViewDialog = ({
  order,
  open,
  onClose,
  getStatusText,
  getStatusColor,
  onUpdateStatus,
  onAssignCourier
}) => {
  if (!order) return null;

  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const getAvailableStatuses = (currentStatus) => {
    const allStatuses = [
      { value: 'pending', label: 'Kutilmoqda' },
      { value: 'processing', label: 'Jarayonda' },
      { value: 'confirmed', label: 'Tasdiqlangan' },
      { value: 'shipped', label: 'Yetkazilmoqda' },
      { value: 'delivered', label: 'Yetkazildi' },
      { value: 'cancelled', label: 'Bekor qilindi' }
    ];

    // Bekor qilingan buyurtmaning holatini o'zgartirib bo'lmaydi
    if (currentStatus === 'cancelled') {
      return [];
    }

    // Yetkazilgan buyurtmaning holatini o'zgartirib bo'lmaydi
    if (currentStatus === 'delivered') {
      return [];
    }

    // Joriy holatdan keyingi mumkin bo'lgan holatlar
    const statusOrder = {
      pending: ['processing', 'cancelled'],
      processing: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled']
    };

    const availableStatuses = statusOrder[currentStatus] || [];
    return allStatuses.filter(status => availableStatuses.includes(status.value));
  };

  const [courierDialogOpen, setCourierDialogOpen] = useState(false);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        elevation: 8
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Buyurtma #{order.orderId}
          </Typography>
          <Box>
            <Chip
              label={getStatusText(order.status)}
              color={getStatusColor(order.status)}
              size="small"
              sx={{ mr: 2 }}
            />
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{ color: 'white' }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }} style={{paddingTop: '20px'}}>
        <Grid container spacing={3}>
          {/* Mijoz ma'lumotlari */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Mijoz ma'lumotlari
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body1">
                  {order?.user?.firstName} {order?.user?.lastName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Tel: {order?.user?.phoneNumber}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Yetkazib berish manzili */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Yetkazib berish manzili
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                <Typography variant="body1">
                  {order?.address?.address}
                  {order?.address?.entrance && `, ${order?.address?.entrance}-kirish`}
                  {order?.address?.floor && `, ${order?.address?.floor}-qavat`}
                  {order?.address?.apartment && `, ${order?.address?.apartment}`}
                </Typography>
              </Box>

              {order?.address?.domofonCode && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                  Domofon: {order?.address?.domofonCode}
                </Typography>
              )}

              {order?.address?.courierComment && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                  Izoh: {order?.address?.courierComment}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Kuryer ma'lumotlari */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Kuryer ma'lumotlari
            </Typography>
            <Box sx={{ pl: 2 }}>
              {order.courier ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body1">
                      {order.courier.firstName} {order.courier.lastName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Tel: {order.courier.phoneNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShippingIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Transport: {order.courier.vehicle} ({order.courier.vehicleNumber})
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    Kuryer tayinlanmagan
                  </Typography>
                  {order.status === 'processing' && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<LocalShippingIcon />}
                      onClick={() => setCourierDialogOpen(true)}
                    >
                      Kuryer tayinlash
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Buyurtma vaqti */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Buyurtma vaqti
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  Buyurtma: {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </Box>
              {order.updatedAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    O'zgartirilgan: {new Date(order.updatedAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Mahsulotlar ro'yxati */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Mahsulotlar ({totalItems} ta)
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nomi</TableCell>
                    <TableCell align="right">Narxi</TableCell>
                    <TableCell align="right">Soni</TableCell>
                    <TableCell align="right">Jami</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {item.product ? item.product.name : 'Mavjud emas'}
                      </TableCell>
                      <TableCell align="right">
                        {item.price?.toLocaleString()} so'm
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {(item.price * item.quantity).toLocaleString()} so'm
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                      Jami:
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {order.totalPrice?.toLocaleString()} so'm
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Yangi buyurtma - tasdiqlash yoki bekor qilish */}
          {order.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onUpdateStatus(order._id, 'confirmed')}
              >
                Tasdiqlash
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => onUpdateStatus(order._id, 'cancelled')}
              >
                Bekor qilish
              </Button>
            </>
          )}

          {/* Tasdiqlangan - jarayonga o'tkazish */}
          {order.status === 'confirmed' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => onUpdateStatus(order._id, 'processing')}
            >
              Jarayonga o'tkazish
            </Button>
          )}

          {/* Jarayonda - kuryer tayinlash */}
          {order.status === 'processing' && !order.courier && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCourierDialogOpen(true)}
            >
              Kuryer tayinlash
            </Button>
          )}

          {/* Har qanday holatda bekor qilish mumkin */}
          {['pending', 'processing', 'confirmed'].includes(order.status) && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => onUpdateStatus(order._id, 'cancelled')}
            >
              Bekor qilish
            </Button>
          )}
        </Box>
        
        <Button onClick={onClose} color="inherit">
          Yopish
        </Button>
      </DialogActions>

      {/* Kuryer dialog */}
      <OrderCourierDialog
        open={courierDialogOpen}
        onClose={() => setCourierDialogOpen(false)}
        order={order}
        onAssign={(courier) => {
          onAssignCourier(order._id, courier);
          setCourierDialogOpen(false);
        }}
      />
    </Dialog>
  );
};

export default OrderViewDialog;
