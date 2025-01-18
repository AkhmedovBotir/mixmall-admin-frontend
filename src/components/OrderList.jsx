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
  Typography,
  Box,
  Chip,
  TablePagination
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const OrderList = ({
  orders,
  onViewOrder,
  getStatusText,
  getStatusColor,
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedOrders = orders.slice(startIndex, endIndex);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Mijoz</TableCell>
              <TableCell>Manzil</TableCell>
              <TableCell>Kuryer</TableCell>
              <TableCell>Summa</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sana</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {order.user?.firstName || ''} {order.user?.lastName || ''}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {order.user?.phoneNumber || ''}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {order.address?.address || ''}
                    {order.address?.entrance && `, ${order.address.entrance}-kirish`}
                    {order.address?.floor && `, ${order.address.floor}-qavat`}
                    {order.address?.apartment && `, ${order.address.apartment}`}
                  </Typography>
                </TableCell>
                <TableCell>
                  {order.courier ? (
                    <Box>
                      <Typography variant="body2">
                        {order.courier?.firstName || ''} {order.courier?.lastName || ''}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.courier?.vehicle?.name || ''} {order.courier?.vehicle?.number ? `- ${order.courier.vehicle.number}` : ''}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Tayinlanmagan
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.totalPrice?.toLocaleString() || 0} so'm
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(order.status)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => onViewOrder(order)}
                    title="Ko'rish"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={orders.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Sahifadagi buyurtmalar"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} / ${count} buyurtma`
        }
      />
    </>
  );
};

export default OrderList;
