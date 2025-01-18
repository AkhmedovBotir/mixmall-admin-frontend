import React from 'react';
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

const OrderViewDialog = ({
  order,
  open,
  onClose,
  getStatusText,
  getStatusColor,
  onUpdateStatus,
  onOpenCourierDialog,
}) => {
  if (!order) return null;

  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
                  {order.user.firstName} {order.user.lastName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Tel: {order.user.phoneNumber}
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
                  {order.address.address}
                  {order.address.entrance && `, ${order.address.entrance}-kirish`}
                  {order.address.floor && `, ${order.address.floor}-qavat`}
                  {order.address.apartment && `, ${order.address.apartment}`}
                </Typography>
              </Box>

              {order.address.domofonCode && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                  Domofon: {order.address.domofonCode}
                </Typography>
              )}

              {order.address.courierComment && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                  Izoh: {order.address.courierComment}
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
                      Transport: {order.courier.vehicle.name} 
                      {order.courier.vehicle.number && ` - ${order.courier.vehicle.number}`}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    Kuryer tayinlanmagan
                  </Typography>
                  {order.status === 'confirmed' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onOpenCourierDialog(order._id)}
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
                      <TableCell>{item.product.name}</TableCell>
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

          {order.status === 'confirmed' && order.courier && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => onUpdateStatus(order._id, 'processing')}
            >
              Jo'natish
            </Button>
          )}
        </Box>
        
        <Button onClick={onClose} color="inherit">
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderViewDialog;
