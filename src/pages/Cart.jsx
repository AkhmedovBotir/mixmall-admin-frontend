import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Space,
  Button,
  Table,
  InputNumber,
  message,
  Spin,
  Modal,
  Radio,
  Tag,
  Divider
} from 'antd';
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  ClearOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Text, Title } = Typography;

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/cart');
      if (response.data.success) {
        setCart(response.data.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      message.error('Savatni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/addresses');
      console.log('Addresses response:', response.data);
      if (response.data?.success && response.data?.data) {
        setAddresses(response.data.data);
        // Asosiy manzilni topish va tanlash
        const mainAddress = response.data.data.find(addr => addr.isMain);
        if (mainAddress) {
          setSelectedAddress(mainAddress._id);
        }
        console.log('Selected main address:', mainAddress);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      message.error('Manzillarni yuklashda xatolik');
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      setUpdating(true);
      const response = await axios.put(`http://localhost:3000/api/cart/item/${itemId}`, {
        quantity,
      });
      
      if (response.data.success) {
        setCart(response.data.cart);
        // Navbar dagi savat sonini yangilash
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: response.data.cart.items.length
        }));
      }
    } catch (error) {
      if (error.response?.status === 400) {
        message.error(error.response.data.message);
      } else {
        console.error('Error updating quantity:', error);
        message.error('Miqdorni yangilashda xatolik');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdating(true);
      const response = await axios.delete(`http://localhost:3000/api/cart/item/${itemId}`);
      
      if (response.data.success) {
        setCart(response.data.cart);
        message.success('Mahsulot savatdan o\'chirildi');
        // Navbar dagi savat sonini yangilash
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: response.data.cart.items.length
        }));
      }
    } catch (error) {
      console.error('Error removing item:', error);
      message.error('Mahsulotni o\'chirishda xatolik');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    try {
      setUpdating(true);
      const response = await axios.delete('http://localhost:3000/api/cart/clear');
      
      if (response.data.success) {
        setCart(response.data.cart);
        message.success('Savat tozalandi');
        // Navbar dagi savat sonini yangilash
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: 0
        }));
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      message.error('Savatni tozalashda xatolik');
    } finally {
      setUpdating(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      if (!selectedAddress) {
        return message.error('Iltimos manzilni tanlang');
      }

      const selectedAddressDetails = addresses.find(addr => addr._id === selectedAddress);
      if (!selectedAddressDetails) {
        return message.error('Tanlangan manzil topilmadi');
      }

      const response = await axios.post('http://localhost:3000/api/orders/create', {
        addressId: selectedAddress,
        address: selectedAddressDetails
      });

      if (response.data?.success) {
        message.success('Buyurtma muvaffaqiyatli joylashtirildi');
        setCart(null);
        setOrderModalVisible(false);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      message.error('Buyurtma berishda xatolik yuz berdi');
    }
  };

  const orderModalFooter = (
    <div>
      <Button onClick={() => setOrderModalVisible(false)}>
        Bekor qilish
      </Button>
      <Button type="primary" onClick={handlePlaceOrder}>
        Buyurtma berish
      </Button>
    </div>
  );

  const columns = [
    {
      title: 'Mahsulot',
      dataIndex: ['product', 'name'],
      key: 'name',
      render: (name, record) => (
        <Space>
          <img
            src={record.product.images[0]}
            alt={name}
            style={{ width: 50, height: 50, objectFit: 'cover' }}
          />
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Narx',
      dataIndex: ['product', 'price'],
      key: 'price',
      render: (price, record) => {
        const actualPrice = record.product.discount_price || price;
        return (
          <Space direction="vertical" size={0}>
            {record.product.discount_price && (
              <Text delete type="secondary">
                {price.toLocaleString()} so'm
              </Text>
            )}
            <Text strong>
              {actualPrice.toLocaleString()} so'm
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Soni',
      key: 'quantity',
      render: (_, record) => (
        <Space>
          <Button
            icon={<MinusOutlined />}
            onClick={() => handleUpdateQuantity(record._id, record.quantity - 1)}
            disabled={record.quantity <= 1 || updating}
          />
          <InputNumber
            min={1}
            value={record.quantity}
            onChange={(value) => handleUpdateQuantity(record._id, value)}
            disabled={updating}
          />
          <Button
            icon={<PlusOutlined />}
            onClick={() => handleUpdateQuantity(record._id, record.quantity + 1)}
            disabled={updating}
          />
        </Space>
      ),
    },
    {
      title: 'Jami',
      key: 'total',
      render: (_, record) => {
        const price = record.product.discount_price || record.product.price;
        return (
          <Text strong>
            {(price * record.quantity).toLocaleString()} so'm
          </Text>
        );
      },
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record._id)}
          loading={updating}
        >
          O'chirish
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <ShoppingCartOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <Title level={3}>Savat bo'sh</Title>
            <Text type="secondary">
              Siz hali hech qanday mahsulot qo'shmagansiz
            </Text>
            <br />
            <Button
              type="primary"
              size="large"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/products')}
              style={{ marginTop: 16 }}
            >
              Xarid qilish
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => {
    const price = item.product.discount_price || item.product.price;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0 }}>
              Savat
            </Title>

            <Button
              type="link"
              danger
              icon={<ClearOutlined />}
              onClick={handleClearCart}
              disabled={updating}
            >
              Savatni tozalash
            </Button>
          </Space>

          <Table
            dataSource={cart?.items || []}
            rowKey={(record) => record._id}
            pagination={false}
            columns={columns}
            summary={() => {
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={3}>
                    <Text strong>Umumiy summa:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text strong>{total?.toLocaleString()} so'm</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell />
                </Table.Summary.Row>
              );
            }}
          />

          <div style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              icon={<ShoppingOutlined />}
              onClick={() => setOrderModalVisible(true)}
              loading={updating}
              disabled={!cart?.items?.length}
            >
              Buyurtma berish
            </Button>
          </div>
        </Space>
      </Card>

      <Modal
        title="Buyurtma berish"
        open={orderModalVisible}
        onCancel={() => setOrderModalVisible(false)}
        footer={orderModalFooter}
      >
        <div style={{ marginBottom: 16 }}>
          <h4>Yetkazib berish manzili:</h4>
          <Radio.Group
            onChange={(e) => setSelectedAddress(e.target.value)}
            value={selectedAddress}
          >
            <Space direction="vertical">
              {addresses.map((address) => (
                <Radio key={address._id} value={address._id}>
                  <Space direction="vertical">
                    <div><strong>Manzil:</strong> {address.address}</div>
                    <div><strong>Xonadon:</strong> {address.apartment}</div>
                    <div><strong>Podez:</strong> {address.entrance}</div>
                    <div><strong>Qavat:</strong> {address.floor}</div>
                    {address.domofonCode && (
                      <div><strong>Domofon:</strong> {address.domofonCode}</div>
                    )}
                    {address.courierComment && (
                      <div><strong>Kuryer uchun izoh:</strong> {address.courierComment}</div>
                    )}
                    {address.isMain && (
                      <Tag color="blue">Asosiy manzil</Tag>
                    )}
                  </Space>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>

        <div>
          <h4>Buyurtma tafsilotlari:</h4>
          {cart.items.map((item) => (
            <div key={item._id} style={{ marginBottom: 8 }}>
              <span>{item.product.name}</span>
              <span style={{ float: 'right' }}>
                {item.quantity} x {item.product.price.toLocaleString()} = {(item.quantity * item.product.price).toLocaleString()} so'm
              </span>
            </div>
          ))}
          <Divider />
          <div style={{ textAlign: 'right' }}>
            <h3>Jami: {total.toLocaleString()} so'm</h3>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cart;
