import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Typography,
  Space,
  Input,
  Button,
  message,
} from 'antd';
import {
  SafetyCertificateOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!location.state?.email) {
      navigate('/login');
      return;
    }

    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, location.state?.email, navigate]);

  const handleVerify = async () => {
    if (!code) {
      message.error('Iltimos, kodni kiriting');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3000/api/auth/verify', {
        email: location.state.email,
        code,
      });
      
      if (response.data.success) {
        message.success('Email muvaffaqiyatli tasdiqlandi');
        localStorage.setItem('token', response.data.token);
        navigate('/');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        message.error(error.response.data.message);
      } else {
        console.error('Error verifying code:', error);
        message.error('Kodni tasdiqlashda xatolik');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const response = await axios.post('http://localhost:3000/api/auth/resend-code', {
        email: location.state.email,
      });
      
      if (response.data.success) {
        message.success('Yangi kod yuborildi');
        setCountdown(60);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        message.error(error.response.data.message);
      } else {
        console.error('Error resending code:', error);
        message.error('Kodni qayta yuborishda xatolik');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '24px',
      background: '#f0f2f5',
    }}>
      <Card style={{ width: '100%', maxWidth: 400 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <SafetyCertificateOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <Title level={2} style={{ margin: '16px 0 0' }}>
              Email tasdiqlash
            </Title>
            <Text type="secondary">
              {location.state?.email} manziliga yuborilgan kodni kiriting
            </Text>
          </div>

          <Space.Compact style={{ width: '100%' }}>
            <Input
              size="large"
              placeholder="Kodni kiriting"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onPressEnter={handleVerify}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleVerify}
              loading={loading}
            >
              Tasdiqlash
            </Button>
          </Space.Compact>

          <div style={{ textAlign: 'center' }}>
            <Button
              type="link"
              icon={<ReloadOutlined />}
              onClick={handleResend}
              loading={resending}
              disabled={countdown > 0}
            >
              {countdown > 0 ? `${countdown} soniyadan so'ng qayta yuborish` : 'Qayta yuborish'}
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default VerifyCode;