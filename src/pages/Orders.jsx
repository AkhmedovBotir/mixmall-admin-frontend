import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  message,
  Typography,
  Button,
  Modal,
  Descriptions,
  Spin,
} from 'antd';
import axios from 'axios';
import { ShoppingOutlined, EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

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
    } finally {
      setLoading(false);
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

  const columns = [
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
            setModalVisible(true);
          }}
        >
          Batafsil
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

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <ShoppingOutlined />
            <span>Mening buyurtmalarim</span>
          </Space>
        }
      >
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="orderId"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Jami ${total} ta buyurtma`,
          }}
        />
      </Card>

      <Modal
        title="Buyurtma tafsilotlari"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
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
                      `${(record.quantity * record.product.price).toLocaleString()} so'm`,
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
    </div>
  );
};

export default Orders;
