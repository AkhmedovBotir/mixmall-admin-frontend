import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Typography,
  Badge,
  Rate,
  Space,
  Pagination,
  Tag,
  Spin,
  message,
  Divider,
  Affix,
  Empty,
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  SearchOutlined,
  FilterOutlined,
  ShopOutlined,
  ThunderboltOutlined,
  FireOutlined,
  StarOutlined,
  TagOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { getProducts, addToCart } from '../api';

const { Content } = Layout;
const { Meta } = Card;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    sort: '',
    page: 1,
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts(filters);
      if (response.data?.products) {
        setItems(response.data.products);
        setTotal(response.data.total);
        setPages(response.data.pages);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Mahsulotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleSort = (value) => {
    setFilters(prev => ({ ...prev, sort: value, page: 1 }));
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await addToCart({ productId, quantity: 1 });
      if (response.data?.success) {
        message.success({
          content: "Mahsulot savatga qo'shildi",
          icon: <ShoppingCartOutlined style={{ color: '#52c41a' }} />,
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        message.error({
          content: 'Iltimos, avval tizimga kiring',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        });
      } else {
        message.error({
          content: "Xatolik yuz berdi",
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        });
      }
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '24px 50px' }}>
        {/* Features Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[
            {
              icon: <ThunderboltOutlined style={{ fontSize: 24 }} />,
              title: 'Tezkor yetkazib berish',
              description: '24 soat ichida',
            },
            {
              icon: <TagOutlined style={{ fontSize: 24 }} />,
              title: 'Qulay narxlar',
              description: 'Hamyonbop narxlar',
            },
            {
              icon: <StarOutlined style={{ fontSize: 24 }} />,
              title: 'Yuqori sifat',
              description: 'Sifat kafolati',
            },
            {
              icon: <FireOutlined style={{ fontSize: 24 }} />,
              title: 'Chegirmalar',
              description: 'Doimiy aksiyalar',
            },
          ].map((feature, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card hoverable className="feature-card">
                <Space direction="vertical" align="center" style={{ width: '100%', textAlign: 'center' }}>
                  {feature.icon}
                  <Title level={4} style={{ margin: '8px 0' }}>
                    {feature.title}
                  </Title>
                  <Text type="secondary">{feature.description}</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Search and Filters */}
        <Affix offsetTop={10}>
          <Card style={{ marginBottom: 24, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Search
                  className="search-bar"
                  placeholder="Mahsulot qidirish"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  onSearch={handleSearch}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  className="search-bar"
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="Saralash"
                  onChange={handleSort}
                >
                  <Select.Option value="price_asc">Narx: arzondan qimmatga</Select.Option>
                  <Select.Option value="price_desc">Narx: qimmatdan arzonga</Select.Option>
                  <Select.Option value="newest">Eng yangi</Select.Option>
                  <Select.Option value="popular">Eng mashhur</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Button
                  type="primary"
                  icon={<FilterOutlined />}
                  size="large"
                  style={{ width: '100%' }}
                >
                  Filtrlash
                </Button>
              </Col>
            </Row>
          </Card>
        </Affix>

        {/* Products Grid */}
        <div className="products-container">
          <Spin spinning={loading} size="large">
            {items && items.length > 0 ? (
              <Row gutter={[24, 24]} className="products-row">
                {items.map((product) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                    <Badge.Ribbon
                      text={`${product.discount_percent}% chegirma`}
                      color="#ff4d4f"
                      style={{ 
                        display: product.discount_percent ? 'block' : 'none',
                        padding: '0 15px',
                        height: '30px',
                        lineHeight: '30px',
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      <Card
                        className="product-card"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        <div className="product-image-container">
                          <img
                            alt={product.name}
                            src={product.images[0]}
                            className="product-image"
                          />
                        </div>
                        <div className="product-info">
                          <div className="product-header">
                            <div className="product-brand">
                              {product.brand && (
                                <Tag color="blue">{product.brand.name}</Tag>
                              )}
                            </div>
                            <div className="product-stock-badge">
                              {product.stock > 0 ? (
                                <Tag color="success">Mavjud</Tag>
                              ) : (
                                <Tag color="error">Tugadi</Tag>
                              )}
                            </div>
                          </div>
                          
                          <Title level={5} className="product-title">
                            {product.name}
                          </Title>
                          
                          <div className="product-meta">
                            <div className="product-rating">
                              <Rate 
                                disabled 
                                defaultValue={product.averageRating} 
                                className="rating-stars"
                              />
                              <Text type="secondary" className="rating-count">
                                ({product.totalRatings})
                              </Text>
                            </div>
                            
                            <div className="product-price">
                              {product.discount_price !== product.price ? (
                                <div className="price-with-discount">
                                  <Text delete type="secondary" className="original-price">
                                    {product.price.toLocaleString()} so'm
                                  </Text>
                                  <Text className="discount-price">
                                    {product.discount_price.toLocaleString()} so'm
                                  </Text>
                                </div>
                              ) : (
                                <Text className="regular-price">
                                  {product.price.toLocaleString()} so'm
                                </Text>
                              )}
                            </div>
                          </div>

                          <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product._id);
                            }}
                            className="add-to-cart-button"
                            block
                          >
                            Savatga qo'shish
                          </Button>
                        </div>
                      </Card>
                    </Badge.Ribbon>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                description="Mahsulotlar topilmadi"
                style={{ margin: '48px auto' }}
              />
            )}
          </Spin>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <Row justify="center" style={{ margin: '24px 0' }}>
            <Pagination
              current={page}
              total={total}
              pageSize={12}
              onChange={(page) => setFilters(prev => ({ ...prev, page }))}
              showSizeChanger={false}
              showTotal={(total) => `Jami ${total} ta mahsulot`}
            />
          </Row>
        )}
      </Content>
    </Layout>
  );
};

export default Home;
