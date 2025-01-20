import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Sell as SellIcon,
  Logout as LogoutIcon,
  LocalMall as ProductIcon,
  AccountCircle as AccountIcon,
  ShoppingCart as OrdersIcon,
  Person as UserIcon,
  LocalShipping as LocalShippingIcon,
  Inventory2 as Inventory2Icon,
  BrandingWatermark as BrandingWatermarkIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

const menuItems = [
  {
    text: 'Dashboard',
    path: '/',
    icon: <DashboardIcon />,
    requiredPermission: 'view_dashboard'
  },
  {
    text: 'Adminlar',
    path: '/admins',
    icon: <AdminPanelSettingsIcon />,
    requiredPermission: 'manage_admins'
  },
  {
    text: 'Kuryerlar',
    path: '/couriers',
    icon: <LocalShippingIcon />,
    requiredPermission: 'manage_couriers'
  },
  {
    text: 'Foydalanuvchilar',
    path: '/users',
    icon: <PeopleIcon />,
    requiredPermission: 'manage_users'
  },
  {
    text: 'Brendlar',
    path: '/brands',
    icon: <BrandingWatermarkIcon />,
    requiredPermission: 'manage_brands'
  },
  {
    text: 'Kategoriyalar',
    path: '/categories',
    icon: <CategoryIcon />,
    requiredPermission: 'manage_categories'
  },
  {
    text: 'Mahsulotlar',
    path: '/products',
    icon: <Inventory2Icon />,
    requiredPermission: 'manage_products'
  },
  {
    text: 'Buyurtmalar',
    path: '/orders',
    icon: <OrdersIcon />,
    requiredPermission: 'manage_orders'
  },
  {
    text: 'Statistika',
    path: '/statistics',
    icon: <AssessmentIcon />,
    requiredPermission: 'view_statistics'
  },
  {
    text: 'Sozlamalar',
    path: '/settings',
    icon: <SettingsIcon />,
    requiredPermission: 'manage_settings'
  }
];

export default function Layout() {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get admin data and permissions
  const adminStr = localStorage.getItem('admin');
  const admin = adminStr ? JSON.parse(adminStr) : null;
  const permissions = admin?.permissions || [];

  // Check if user has permission
  const hasPermission = (requiredPermission) => {
    if (!requiredPermission) return true;
    if (admin?.role === 'superadmin') return true;
    return permissions.includes(requiredPermission);
  };

  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter(item => hasPermission(item.requiredPermission));

  useEffect(() => {
    if (!admin || !localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [admin, navigate]);

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('permissions');
    navigate('/login');
  };

  const drawer = (
    <>
      <Box sx={{ 
        py: 5, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {open ? 'ADMIN PANEL' : 'AP'}
        </Typography>
      </Box>

      <List sx={{ pt: 3 }}>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => isMobile && setOpen(false)}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  py: 1.5,
                  borderRadius: '0 24px 24px 0',
                  marginRight: 2,
                  marginY: 0.5,
                  position: 'relative',
                  ...(isActive && {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      bgcolor: 'white',
                      borderRadius: '0 4px 4px 0',
                    },
                  }),
                  '&:hover': {
                    bgcolor: isActive ? 'primary.main' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    mr: open ? 3 : 0,
                    justifyContent: 'center',
                    color: isActive ? 'white' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: open ? 1 : 0,
                    display: open ? 'block' : 'none',
                    '& .MuiTypography-root': {
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'white' : 'text.primary',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${open ? drawerWidth : 70}px)` },
          ml: { xs: 0, md: `${open ? drawerWidth : 70}px` },
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
              }}
              onClick={handleProfileMenuOpen}
            >
              <Avatar
                sx={{
                  width: { xs: 35, sm: 40 },
                  height: { xs: 35, sm: 40 },
                  bgcolor: theme.palette.primary.main,
                  cursor: 'pointer',
                }}
              >
                {admin?.name?.[0] || 'A'}
              </Avatar>
            </Box>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                minWidth: 200,
              }
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {admin?.name || 'Admin User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {admin?.email || 'admin@example.com'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose}>
              <ListItemIcon>
                <AccountIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={isMobile && open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            ...(!open && {
              width: '70px',
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }),
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${open ? drawerWidth : 70}px)` },
          ml: { xs: 0, md: `${open ? drawerWidth : 70}px` },
          pt: '64px',
          transition: theme.transitions.create(['width', 'margin-left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
