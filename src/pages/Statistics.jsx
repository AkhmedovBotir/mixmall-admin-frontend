import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  Person as UserIcon,
  LocalShipping as CourierIcon,
  Inventory as ProductIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../api/axios';

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [courierStats, setCourierStats] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  const fetchAllStatistics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/statistics/dashboard');
      
      if (!data) {
        throw new Error('Ma\'lumotlarni yuklashda xatolik');
      }
      
      setDashboardStats(data);
      setProductStats(data.products);
      setCourierStats(data.couriers.stats || []);
      setError('');
    } catch (error) {
      console.error('Statistikani yuklashda xatolik:', error);
      setError(error.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Kutilmoqda';
      case 'processing':
        return 'Jarayonda';
      case 'shipped':
        return 'Yuborilgan';
      case 'delivered':
        return 'Yetkazilgan';
      case 'cancelled':
        return 'Bekor qilingan';
      default:
        return status;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}.lighter`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color: `${color}.main`, fontSize: 24 }} />
          </Box>
          <Typography variant="h6" sx={{ ml: 2, color: 'text.primary' }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const OrderStats = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Bugungi buyurtmalar"
            value={dashboardStats?.orders?.today?.count || 0}
            subtitle={`${(dashboardStats?.orders?.today?.amount || 0).toLocaleString()} so'm`}
            icon={OrderIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Haftalik buyurtmalar"
            value={dashboardStats?.orders?.weekly?.count || 0}
            subtitle={`${(dashboardStats?.orders?.weekly?.amount || 0).toLocaleString()} so'm`}
            icon={OrderIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Oylik buyurtmalar"
            value={dashboardStats?.orders?.monthly?.count || 0}
            subtitle={`${(dashboardStats?.orders?.monthly?.amount || 0).toLocaleString()} so'm`}
            icon={OrderIcon}
            color="success"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Buyurtmalar holati
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Holat</TableCell>
                <TableCell align="right">Soni</TableCell>
                <TableCell align="right">Umumiy summa</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardStats?.orders?.byStatus?.map((status) => (
                <TableRow key={status._id}>
                  <TableCell>{getStatusText(status._id)}</TableCell>
                  <TableCell align="right">{status.count}</TableCell>
                  <TableCell align="right">{status.totalAmount.toLocaleString()} so'm</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const ProductStats = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Jami mahsulotlar"
            value={productStats?.total || 0}
            icon={ProductIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tugagan mahsulotlar"
            value={productStats?.outOfStock || 0}
            icon={ProductIcon}
            color="error"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Ko'p sotilgan mahsulotlar
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mahsulot nomi</TableCell>
                <TableCell align="right">Sotilgan soni</TableCell>
                <TableCell align="right">Umumiy summa</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productStats?.topSelling?.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell align="right">{item.totalQuantity}</TableCell>
                  <TableCell align="right">{item.totalAmount.toLocaleString()} so'm</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const CourierStats = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Jami kuryerlar"
            value={dashboardStats?.couriers?.total || 0}
            icon={CourierIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Faol kuryerlar"
            value={dashboardStats?.couriers?.active || 0}
            icon={CourierIcon}
            color="success"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Kuryerlar statistikasi
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kuryer</TableCell>
                <TableCell align="right">Buyurtmalar</TableCell>
                <TableCell align="right">Umumiy summa</TableCell>
                <TableCell align="right">O'rtacha yetkazish vaqti</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courierStats?.map((courier) => (
                <TableRow key={courier.courier.phoneNumber}>
                  <TableCell>
                    {courier.courier.firstName} {courier.courier.lastName}
                  </TableCell>
                  <TableCell align="right">{courier.deliveredOrders}</TableCell>
                  <TableCell align="right">{courier.totalAmount.toLocaleString()} so'm</TableCell>
                  <TableCell align="right">{courier.averageDeliveryTime} daqiqa</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Statistika
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Buyurtmalar" />
          <Tab label="Mahsulotlar" />
          <Tab label="Kuryerlar" />
        </Tabs>
      </Box>

      {activeTab === 0 && <OrderStats />}
      {activeTab === 1 && <ProductStats />}
      {activeTab === 2 && <CourierStats />}
    </Box>
  );
};

export default Statistics;
