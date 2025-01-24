import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admins from './pages/Admins';
import Brands from './pages/Brands';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Couriers from './pages/Couriers';
import CourierDeliveries from './pages/CourierDeliveries';
import Statistics from './pages/Statistics';

// Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Permission checker component
const PermissionRoute = ({ children, requiredPermission }) => {
  const adminStr = localStorage.getItem('admin');
  const admin = adminStr ? JSON.parse(adminStr) : null;

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  // Superadmin uchun barcha ruxsatlar mavjud
  if (admin.role === 'superadmin') {
    return <>{children}</>;
  }

  // Permissions mavjudligini tekshirish
  if (!admin.permissions) {
    return <Navigate to="/" replace />;
  }

  // Kerakli ruxsat borligini tekshirish
  if (admin.permissions.includes(requiredPermission)) {
    return <>{children}</>;
  }

  return <Navigate to="/" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            {/* Dashboard */}
            <Route index element={
              <PermissionRoute requiredPermission="view_dashboard">
                <Dashboard />
              </PermissionRoute>
            } />
            
            {/* Admins */}
            <Route path="admins">
              <Route index element={
                <PermissionRoute requiredPermission="manage_admins">
                  <Admins />
                </PermissionRoute>
              } />
            </Route>

            {/* Users */}
            <Route path="users">
              <Route index element={
                <PermissionRoute requiredPermission="manage_users">
                  <Users />
                </PermissionRoute>
              } />
            </Route>

            {/* Couriers */}
            <Route path="couriers">
              <Route index element={
                <PermissionRoute requiredPermission="manage_couriers">
                  <Couriers />
                </PermissionRoute>
              } />
            </Route>

            {/* Brands */}
            <Route path="brands">
              <Route index element={
                <PermissionRoute requiredPermission="manage_brands">
                  <Brands />
                </PermissionRoute>
              } />
            </Route>

            {/* Categories */}
            <Route path="categories">
              <Route index element={
                <PermissionRoute requiredPermission="manage_categories">
                  <Categories />
                </PermissionRoute>
              } />
            </Route>

            {/* Products */}
            <Route path="products">
              <Route index element={
                <PermissionRoute requiredPermission="manage_products">
                  <Products />
                </PermissionRoute>
              } />
            </Route>

            {/* Orders */}
            <Route path="orders">
              <Route index element={
                <PermissionRoute requiredPermission="manage_orders">
                  <Orders />
                </PermissionRoute>
              } />
            </Route>

            {/* Statistics */}
            <Route path="statistics">
              <Route index element={
                <PermissionRoute requiredPermission="view_statistics">
                  <Statistics />
                </PermissionRoute>
              } />
            </Route>

            {/* Courier Deliveries */}
            <Route path="courier-deliveries">
              <Route index element={
                <PermissionRoute requiredPermission="manage_couriers">
                  <CourierDeliveries />
                </PermissionRoute>
              } />
            </Route>
          </Route>

          {/* Not Found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
