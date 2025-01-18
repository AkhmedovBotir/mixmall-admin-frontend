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
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  Person as UserIcon,
  LocalShipping as CourierIcon,
  Inventory as ProductIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import api from '../api/axios';

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/statistics');
      if (response.data.success) {
        setStats(response.data.data);
        setError('');
      } else {
        console.error('Invalid response format:', response.data);
        setError('Ma\'lumotlarni yuklashda xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Statistikani yuklashda xatolik:', error);
      setError(error.response?.data?.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
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

  const StatCard = ({ title, value, icon: Icon, color }) => (
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
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Statistika
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Buyurtmalar"
            value={stats?.totalOrders || 0}
            icon={OrderIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Mijozlar"
            value={stats?.totalUsers || 0}
            icon={UserIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Kuryerlar"
            value={stats?.totalCouriers || 0}
            icon={CourierIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Mahsulotlar"
            value={stats?.totalProducts || 0}
            icon={ProductIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Umumiy summa"
            value={`${stats?.totalRevenue?.toLocaleString() || 0} so'm`}
            icon={MoneyIcon}
            color="error"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          So'nggi buyurtmalar
        </Typography>
        <Box sx={{ width: '100%', overflow: 'auto' }}>
          <Box sx={{ minWidth: 800 }}>
            <Box sx={{ display: 'flex', py: 2, px: 2.5, bgcolor: 'background.neutral' }}>
              <Box sx={{ width: '25%' }}>
                <Typography variant="subtitle2">Buyurtma ID</Typography>
              </Box>
              <Box sx={{ width: '25%' }}>
                <Typography variant="subtitle2">Sana</Typography>
              </Box>
              <Box sx={{ width: '25%' }}>
                <Typography variant="subtitle2">Holati</Typography>
              </Box>
              <Box sx={{ width: '25%' }}>
                <Typography variant="subtitle2">Summa</Typography>
              </Box>
            </Box>

            <Divider />

            {stats?.recentOrders?.map((order) => (
              <React.Fragment key={order._id}>
                <Box sx={{ display: 'flex', py: 2, px: 2.5 }}>
                  <Box sx={{ width: '25%' }}>
                    <Typography variant="body2">{order.orderId}</Typography>
                  </Box>
                  <Box sx={{ width: '25%' }}>
                    <Typography variant="body2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ width: '25%' }}>
                    <Typography variant="body2">{order.status}</Typography>
                  </Box>
                  <Box sx={{ width: '25%' }}>
                    <Typography variant="body2">
                      {order.totalPrice.toLocaleString()} so'm
                    </Typography>
                  </Box>
                </Box>
                <Divider />
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Statistics;
