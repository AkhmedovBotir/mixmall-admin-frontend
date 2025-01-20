import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  Inventory as ProductIcon,
  Person as UserIcon,
  LocalShipping as CourierIcon,
  AttachMoney as RevenueIcon,
  Pending as PendingIcon,
  LocalShipping as ProcessingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getDashboardSummary, getRecentOrders, getOrdersStats } from '../api/dashboardAPI';

// ChartJS ni ro'yxatdan o'tkazish
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Statistika kartasi komponenti
const StatCard = ({ title, value, icon: Icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ color: color || theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ textAlign: 'center' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderStats, setOrderStats] = useState([]);
  const [error, setError] = useState('');

  // Ma'lumotlarni yuklash
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getDashboardSummary();
        
        console.log('Dashboard data:', response);

        // API dan kelgan ma'lumotlarni to'g'ridan-to'g'ri ishlatamiz
        setSummary({
          orders: response.orders,
          products: response.products,
          users: response.users,
          couriers: response.couriers
        });
        
        // ordersData va statsData uchun default qiymatlar
        const defaultOrders = { orders: [] };
        const defaultStats = { stats: [] };
        
        setRecentOrders((response.ordersData || defaultOrders).orders);
        setOrderStats((response.statsData || defaultStats).stats);
      } catch (error) {
        console.error('Dashboard data error:', error);
        setError('Ma\'lumotlarni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart ma'lumotlarini tayyorlash
  const chartData = {
    labels: orderStats.map(stat => 
      format(new Date(stat._id.year, stat._id.month - 1, stat._id.day), 'dd/MM')
    ),
    datasets: [
      {
        label: 'Buyurtmalar soni',
        data: orderStats.map(stat => stat.count),
        borderColor: theme.palette.primary.main,
        tension: 0.4,
      },
      {
        label: 'Daromad (UZS)',
        data: orderStats.map(stat => stat.revenue),
        borderColor: theme.palette.success.main,
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Buyurtmalar statistikasi'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Asosiy statistika */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Jami buyurtmalar"
            value={summary?.orders?.count || 0}
            icon={OrderIcon}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Umumiy daromad"
            value={`${(summary?.orders?.revenue || 0).toLocaleString()} UZS`}
            icon={RevenueIcon}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Mahsulotlar"
            value={summary?.products?.total || 0}
            icon={ProductIcon}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Kurierlar"
            value={summary?.couriers || 0}
            icon={CourierIcon}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* Buyurtmalar holati */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Kutilmoqda"
            value={summary?.orders?.pending || 0}
            icon={PendingIcon}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Jarayonda"
            value={summary?.orders?.processing || 0}
            icon={ProcessingIcon}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Yetkazildi"
            value={summary?.orders?.delivered || 0}
            icon={DeliveredIcon}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bekor qilindi"
            value={summary?.orders?.cancelled || 0}
            icon={CancelledIcon}
            color={theme.palette.error.main}
          />
        </Grid>
      </Grid>

      {/* Grafik */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Line data={chartData} options={chartOptions} />
          </Paper>
        </Grid>
      </Grid>

      {/* So'nggi buyurtmalar */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              So'nggi buyurtmalar
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Buyurtma ID</TableCell>
                    <TableCell>Sana</TableCell>
                    <TableCell>Mijoz</TableCell>
                    <TableCell>Kurier</TableCell>
                    <TableCell>Holat</TableCell>
                    <TableCell align="right">Summa</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {`${order.user.firstName} ${order.user.lastName}`}
                      </TableCell>
                      <TableCell>
                        {order.courier ? (
                          `${order.courier.firstName} ${order.courier.lastName}`
                        ) : (
                          'Tayinlanmagan'
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: {
                              pending: theme.palette.warning.main,
                              processing: theme.palette.info.main,
                              shipped: theme.palette.info.main,
                              delivered: theme.palette.success.main,
                              cancelled: theme.palette.error.main,
                            }[order.status],
                          }}
                        >
                          {
                            {
                              pending: 'Kutilmoqda',
                              processing: 'Jarayonda',
                              shipped: 'Yetkazilmoqda',
                              delivered: 'Yetkazildi',
                              cancelled: 'Bekor qilindi',
                            }[order.status]
                          }
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {order.totalPrice.toLocaleString()} UZS
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
