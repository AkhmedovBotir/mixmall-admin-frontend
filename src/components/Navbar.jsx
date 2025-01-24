import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Badge,
  Space,
  Avatar,
  Dropdown,
  Typography,
} from 'antd';
import {
  HomeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  HeartOutlined,
  ShopOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
      fetchCartItemCount();
    } else {
      setLoading(false);
    }
    fetchCategories();

    // cartUpdated eventini tinglash
    const handleCartUpdated = (event) => {
      setCartItemCount(event.detail);
    };
    window.addEventListener('cartUpdated', handleCartUpdated);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItemCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/cart');
      if (response.data.success) {
        setCartItemCount(response.data.cart.items.length);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    message.success('Tizimdan chiqdingiz');
    navigate('/login');
  };

  const userMenu = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Profil</Link>,
    },
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: <Link to="/orders">Buyurtmalar</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Chiqish',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">Bosh sahifa</Link>,
    },
    {
      key: 'products',
      icon: <AppstoreOutlined />,
      label: <Link to="/products">Mahsulotlar</Link>,
    },
  ];

  if (user) {
    menuItems.push(
      {
        key: 'cart',
        icon: (
          <Badge count={cartItemCount} size="small">
            <ShoppingCartOutlined style={{ fontSize: '18px' }} />
          </Badge>
        ),
        label: <Link to="/cart">Savat</Link>,
      }
    );
  }

  if (loading) {
    return null;
  }

  return (
    <Header style={{ background: '#fff', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', marginRight: 40 }}>
            <ShopOutlined style={{ fontSize: 24, marginRight: 8 }} />
            <Text strong style={{ fontSize: 18, marginRight: 20 }}>MixMall</Text>
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ border: 'none', flex: 1 }}
          />
        </div>

        <Space>
          {loading ? (
            <Button type="text" icon={<UserOutlined />} loading />
          ) : user ? (
            <Dropdown
              menu={{ items: userMenu }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <Text strong>{user.firstName} {user.lastName}</Text>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Button type="text" onClick={() => navigate('/login')}>
                Kirish
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                Ro'yxatdan o'tish
              </Button>
            </Space>
          )}
        </Space>
      </div>
    </Header>
  );
};

export default Navbar;
