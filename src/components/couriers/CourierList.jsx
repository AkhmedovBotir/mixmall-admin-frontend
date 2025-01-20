import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
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

const CourierList = ({
  couriers,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ism familiya</TableCell>
            <TableCell>Telefon</TableCell>
            <TableCell>Transport</TableCell>
            <TableCell>Buyurtmalar</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Amallar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {couriers.map((courier) => (
            <TableRow key={courier._id}>
              <TableCell>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {courier.firstName} {courier.lastName}
                </Typography>
              </TableCell>
              <TableCell>
                {courier.phoneNumber}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCarIcon sx={{ color: '#1a237e', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2">
                      {courier.vehicle}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {courier.vehicleNumber}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {courier.orders?.length || courier.deliveredOrders || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusText(courier.status)}
                  color={getStatusColor(courier.status)}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <IconButton
                    onClick={() => onView(courier)}
                    size="small"
                    sx={{ color: '#1a237e', '&:hover': { backgroundColor: 'rgba(26, 35, 126, 0.1)' } }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => onEdit(courier)}
                    size="small"
                    sx={{ color: '#1a237e', '&:hover': { backgroundColor: 'rgba(26, 35, 126, 0.1)' } }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(courier)}
                    size="small"
                    sx={{
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.1)'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {couriers.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  Kuryerlar topilmadi
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CourierList;
