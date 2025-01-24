import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Table,
  Modal,
  Form,
  Input,
  message,
  Tabs,
  Upload,
  Avatar,
  Divider,
  Switch,
  Spin,
  Tag,
  Descriptions,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Text, Title } = Typography;
const { TextArea } = Input;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchAddresses();
    fetchOrders();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/profile/');
      console.log('User data response:', response.data);
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
        setImageUrl(response.data.data.image);
        console.log('User state:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Foydalanuvchi ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/orders');
      console.log('Orders response:', response.data);
      if (response.data?.success && response.data?.data) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Buyurtmalarni yuklashda xatolik');
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/addresses');
      console.log('Addresses response:', response.data);
      if (response.data?.success && response.data?.data) {
        setAddresses(response.data.data);
        console.log('Addresses state:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      message.error('Manzillarni yuklashda xatolik');
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      const response = await axios.put('http://localhost:3000/api/user/update', values);
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
        message.success('Profil ma\'lumotlari yangilandi');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Profil ma\'lumotlarini yangilashda xatolik');
    }
  };

  const handleAddAddress = async (values) => {
    try {
      if (editingAddress) {
        const response = await axios.put(`http://localhost:3000/api/addresses/${editingAddress._id}`, values);
        if (response.data?.success && response.data?.data) {
          setUser(response.data.data);
          message.success('Manzil yangilandi');
        }
      } else {
        const response = await axios.post('http://localhost:3000/api/addresses', values);
        if (response.data?.success && response.data?.data) {
          setUser(response.data.data);
          message.success('Manzil qo\'shildi');
        }
      }
      setAddressModalVisible(false);
      addressForm.resetFields();
      setEditingAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
      message.error('Manzilni saqlashda xatolik');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    addressForm.setFieldsValue(address);
    setAddressModalVisible(true);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/addresses/${addressId}`);
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
        message.success('Manzil o\'chirildi');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      message.error('Manzilni o\'chirishda xatolik');
    }
  };

  const handleSetMainAddress = async (addressId) => {
    try {
      const response = await axios.put(`http://localhost:3000/api/addresses/${addressId}/main`);
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
        message.success('Asosiy manzil o\'zgartirildi');
      }
    } catch (error) {
      console.error('Error setting main address:', error);
      message.error('Asosiy manzilni o\'zgartirishda xatolik');
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const response = await axios.post('http://localhost:3000/api/user/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data?.success && response.data?.data) {
        setImageUrl(response.data.data.image);
        message.success('Rasm yuklandi');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Rasmni yuklashda xatolik');
    } finally {
      setUploading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'gold', text: 'Kutilmoqda' },
      processing: { color: 'blue', text: 'Jarayonda' },
      shipped: { color: 'cyan', text: 'Yetkazilmoqda' },
      delivered: { color: 'green', text: 'Yetkazildi' },
      cancelled: { color: 'red', text: 'Bekor qilingan' }
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const addressColumns = [
    {
      title: 'Manzil',
      key: 'address',
      render: (record) => (
        <Space direction="vertical">
          <div><strong>Manzil:</strong> {record.address}</div>
          <div><strong>Xonadon:</strong> {record.apartment}</div>
          <div><strong>Podez:</strong> {record.entrance}</div>
          <div><strong>Qavat:</strong> {record.floor}</div>
          <div><strong>Domofon:</strong> {record.domofonCode}</div>
          <div><strong>Kuryer uchun izoh:</strong> {record.courierComment}</div>
        </Space>
      ),
    },
    {
      title: 'Asosiy',
      dataIndex: 'isMain',
      key: 'isMain',
      render: (isMain, record) => (
        <Switch
          checked={isMain}
          onChange={() => handleSetMainAddress(record._id)}
          disabled={isMain}
        />
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingAddress(record);
              setAddressModalVisible(true);
            }}
          >
            Tahrirlash
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAddress(record._id)}
            disabled={record.isMain}
          >
            O'chirish
          </Button>
        </Space>
      ),
    },
  ];

  const orderColumns = [
    {
      title: 'Buyurtma ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('uz-UZ'),
    },
    {
      title: 'Mahsulotlar',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <span>{items.reduce((sum, item) => sum + item.quantity, 0)} ta mahsulot</span>
      ),
    },
    {
      title: 'Umumiy summa',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (amount) => (
        <Text strong>{amount?.toLocaleString()} so'm</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedOrder(record);
            setOrderModalVisible(true);
          }}
        >
          Batafsil
        </Button>
      ),
    },
  ];

  const items = [
    {
      key: 'profile',
      label: 'Profil',
      children: (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Upload
                name="image"
                showUploadList={false}
                beforeUpload={(file) => {
                  handleUpload(file);
                  return false;
                }}
              >
                <Space direction="vertical" size="small">
                  <Avatar
                    size={100}
                    src={imageUrl}
                    icon={<UserOutlined />}
                  />
                  <Button icon={<UploadOutlined />} loading={uploading}>
                    Rasm yuklash
                  </Button>
                </Space>
              </Upload>
            </div>

            <Form
              form={form}
              layout="vertical"
              initialValues={{
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                phone: user?.phone || '',
              }}
              onFinish={handleUpdateProfile}
            >
              <Form.Item
                name="firstName"
                label="Ism"
                rules={[{ required: true, message: 'Iltimos ismingizni kiriting' }]}
              >
                <Input placeholder="Ismingiz" />
              </Form.Item>
              
              <Form.Item
                name="lastName"
                label="Familiya"
                rules={[{ required: true, message: 'Iltimos familiyangizni kiriting' }]}
              >
                <Input placeholder="Familiyangiz" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Telefon"
                rules={[
                  { required: true, message: 'Iltimos telefon raqamingizni kiriting' },
                  { pattern: /^\+998\d{9}$/, message: 'Telefon raqam formati noto\'g\'ri' }
                ]}
              >
                <Input placeholder="+998901234567" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Saqlash
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      ),
    },
    {
      key: 'addresses',
      label: 'Manzillar',
      children: (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>Manzillar</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  addressForm.resetFields();
                  setEditingAddress(null);
                  setAddressModalVisible(true);
                }}
              >
                Manzil qo'shish
              </Button>
            </div>

            <Table
              dataSource={addresses}
              columns={addressColumns}
              rowKey={(record) => record._id}
              pagination={false}
            />
          </Space>
        </Card>
      ),
    },
    {
      key: 'orders',
      label: 'Buyurtmalar',
      children: (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Title level={4}>Buyurtmalar tarixi</Title>
            <Table
              columns={orderColumns}
              dataSource={orders}
              rowKey="orderId"
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Jami ${total} ta buyurtma`,
              }}
            />
          </Space>
        </Card>
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

  return (
    <div style={{ padding: '24px' }}>
      <Tabs items={items} />

      <Modal
        title="Buyurtma tafsilotlari"
        open={orderModalVisible}
        onCancel={() => {
          setOrderModalVisible(false);
          setSelectedOrder(null);
        }}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Buyurtma ID">
                {selectedOrder.orderId}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Sana">
                {new Date(selectedOrder.createdAt).toLocaleString('uz-UZ')}
              </Descriptions.Item>
              <Descriptions.Item label="Yetkazib berish manzili">
                <Space direction="vertical">
                  <div><strong>Manzil:</strong> {selectedOrder.address.address}</div>
                  <div><strong>Xonadon:</strong> {selectedOrder.address.apartment}</div>
                  <div><strong>Podez:</strong> {selectedOrder.address.entrance}</div>
                  <div><strong>Qavat:</strong> {selectedOrder.address.floor}</div>
                  {selectedOrder.address.domofonCode && (
                    <div><strong>Domofon:</strong> {selectedOrder.address.domofonCode}</div>
                  )}
                  {selectedOrder.address.courierComment && (
                    <div><strong>Kuryer uchun izoh:</strong> {selectedOrder.address.courierComment}</div>
                  )}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h4>Buyurtma tarkibi:</h4>
              <Table
                dataSource={selectedOrder.items}
                pagination={false}
                rowKey={(record) => record._id}
                columns={[
                  {
                    title: 'Mahsulot',
                    dataIndex: ['product', 'name'],
                    key: 'name',
                  },
                  {
                    title: 'Narx',
                    dataIndex: ['product', 'price'],
                    key: 'price',
                    render: (price) => `${price.toLocaleString()} so'm`,
                  },
                  {
                    title: 'Soni',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Jami',
                    key: 'total',
                    render: (_, record) => 
                      `${(record.quantity * record.price).toLocaleString()} so'm`,
                  },
                ]}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3}>
                      <Text strong>Umumiy summa:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text strong>
                        {selectedOrder.totalPrice.toLocaleString()} so'm
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </div>
          </>
        )}
      </Modal>

      <Modal
        title={editingAddress ? "Manzilni tahrirlash" : "Yangi manzil qo'shish"}
        open={addressModalVisible}
        onCancel={() => {
          setAddressModalVisible(false);
          setEditingAddress(null);
          addressForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={addressForm}
          layout="vertical"
          onFinish={handleAddAddress}
          initialValues={editingAddress || {}}
        >
          <Form.Item
            name="address"
            label="Manzil"
            rules={[{ required: true, message: 'Iltimos manzilni kiriting' }]}
          >
            <Input.TextArea placeholder="Toshkent shahar, Chilonzor tumani, 19-mavze" />
          </Form.Item>

          <Form.Item
            name="apartment"
            label="Xonadon"
            rules={[{ required: true, message: 'Iltimos xonadon raqamini kiriting' }]}
          >
            <Input placeholder="15-xonadon" />
          </Form.Item>

          <Form.Item
            name="entrance"
            label="Podez"
            rules={[{ required: true, message: 'Iltimos podez raqamini kiriting' }]}
          >
            <Input placeholder="3-podez" />
          </Form.Item>

          <Form.Item
            name="floor"
            label="Qavat"
            rules={[{ required: true, message: 'Iltimos qavatni kiriting' }]}
          >
            <Input placeholder="2" />
          </Form.Item>

          <Form.Item
            name="domofonCode"
            label="Domofon kodi"
          >
            <Input placeholder="1234" />
          </Form.Item>

          <Form.Item
            name="courierComment"
            label="Kuryer uchun izoh"
          >
            <Input.TextArea placeholder="Qo'shimcha ma'lumotlar..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingAddress ? "Saqlash" : "Qo'shish"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;