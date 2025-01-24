import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  message,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3000/api/auth/register', values);
      
      if (response.data.success) {
        message.success('Ro\'yxatdan o\'tish muvaffaqiyatli yakunlandi');
        navigate('/login');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        message.error(error.response.data.message);
      } else {
        console.error('Error registering:', error);
        message.error('Ro\'yxatdan o\'tishda xatolik');
      }
    } finally {
      setLoading(false);
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
            <Title level={2} style={{ margin: 0 }}>
              Ro'yxatdan o'tish
            </Title>
            <Text type="secondary">
              Mixmall online do'koniga xush kelibsiz
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Iltimos, ismingizni kiriting' },
                { min: 2, message: 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Ism"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Iltimos, email manzilingizni kiriting' },
                { type: 'email', message: 'Noto\'g\'ri email formati' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: 'Iltimos, telefon raqamingizni kiriting' },
                { pattern: /^\+998\d{9}$/, message: 'Noto\'g\'ri telefon raqami formati' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="+998901234567"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Iltimos, parolni kiriting' },
                { min: 6, message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Parol"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Iltimos, parolni tasdiqlang' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Parollar mos kelmadi'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Parolni tasdiqlang"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                Ro'yxatdan o'tish
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Akkountingiz bormi? <Link to="/login">Kirish</Link>
              </Text>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default Register;