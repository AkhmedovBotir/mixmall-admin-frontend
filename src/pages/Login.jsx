import React, { useState } from 'react';
import { Form, Input, Button, message, Typography, Card, Space, Row, Col } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifyMode, setVerifyMode] = useState(false);
  const [userData, setUserData] = useState(null);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (!verifyMode) {
        // Login ma'lumotlarini tekshirish
        const response = await axios.post('http://localhost:3000/api/auth/check-login', {
          phoneNumber: values.phoneNumber,
          password: values.password
        });

        if (response.data.success) {
          message.success('SMS kod yuborildi');
          setUserData(values);
          setVerifyMode(true);
        } else {
          message.error(response.data.message || 'Login xatolik');
        }
      } else {
        // SMS kodni tekshirish
        const response = await axios.post('http://localhost:3000/api/auth/verify-login', {
          phoneNumber: userData.phoneNumber,
          code: values.code
        });

        if (response.data.success) {
          // Token ni saqlash
          localStorage.setItem('token', response.data.token);
          // Token ni default headers ga qo'shish
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          
          message.success('Tizimga muvaffaqiyatli kirdingiz!');
          navigate('/profile');
        } else {
          message.error(response.data.message || 'SMS kod xato');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || 'Tizimga kirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={2}>{verifyMode ? 'SMS kodni kiriting' : 'Tizimga kirish'}</Title>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              {!verifyMode ? (
                <>
                  <Form.Item
                    name="phoneNumber"
                    rules={[
                      {
                        required: true,
                        message: 'Telefon raqamini kiriting',
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="+998901234567"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: 'Parolni kiriting',
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Parolni kiriting"
                    />
                  </Form.Item>
                </>
              ) : (
                <Form.Item
                  name="code"
                  rules={[
                    {
                      required: true,
                      message: 'SMS kodni kiriting',
                    },
                  ]}
                >
                  <Input placeholder="12345" maxLength={5} />
                </Form.Item>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  {verifyMode ? 'Tasdiqlash' : 'Kirish'}
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                <Text>
                  Hisobingiz yo'qmi?{' '}
                  <Link to="/register">
                    Ro'yxatdan o'ting
                  </Link>
                </Text>
              </div>
            </Form>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;
