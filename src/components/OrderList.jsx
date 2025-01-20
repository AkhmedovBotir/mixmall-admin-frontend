import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

const OrderList = ({ orders, onViewOrder, getStatusText, getStatusColor }) => {
  if (!orders?.length) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Mijoz</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Kuryer</TableCell>
              <TableCell>Summa</TableCell>
              <TableCell>Sana</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography color="text.secondary">
                  Buyurtmalar mavjud emas
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Mijoz</TableCell>
            <TableCell>Telefon</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Kuryer</TableCell>
            <TableCell>Summa</TableCell>
            <TableCell>Sana</TableCell>
            <TableCell align="right">Amallar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell>{order.orderId}</TableCell>
              <TableCell>
                {order.user?.firstName} {order.user?.lastName}
              </TableCell>
              <TableCell>{order.user?.phoneNumber}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip
                    label={getStatusText(order.status)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </Box>
              </TableCell>
              <TableCell>
                {order.courier ? (
                  <Typography variant="body2">
                    {order.courier.firstName} {order.courier.lastName}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Tayinlanmagan
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {order.totalPrice?.toLocaleString()} so'm
              </TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleString()}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => onViewOrder(order)}
                  color="primary"
                >
                  <VisibilityIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrderList;
