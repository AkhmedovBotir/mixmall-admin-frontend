import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Image, 
  Typography, 
  Tag, 
  Rate, 
  Button, 
  Descriptions,
  Divider,
  message,
  Spin,
  App,
  Card
} from 'antd';
import { ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [categories, setCategories] = useState({});
  const [subcategories, setSubcategories] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/products/${id}`);
        console.log('Product Response:', response.data);
        
        if (response.data.success) {
          const productData = response.data.data;
          setProduct(productData);

          // Kategoriyalarni olish
          if (productData.categories && productData.categories.length > 0) {
            const categoryData = {};
            for (const categoryId of productData.categories) {
              try {
                const catResponse = await axios.get(`http://localhost:3000/api/categories/${categoryId}`);
                if (catResponse.data.success) {
                  categoryData[categoryId] = catResponse.data.data.name;
                }
              } catch (err) {
                console.error('Error fetching category:', err);
              }
            }
            setCategories(categoryData);
          }

          // Subkategoriyalarni olish
          if (productData.subcategories && productData.subcategories.length > 0) {
            const subcategoryData = {};
            for (const subcategoryId of productData.subcategories) {
              try {
                const subcatResponse = await axios.get(`http://localhost:3000/api/categories/${subcategoryId}`);
                if (subcatResponse.data.success) {
                  subcategoryData[subcategoryId] = subcatResponse.data.data.name;
                }
              } catch (err) {
                console.error('Error fetching subcategory:', err);
              }
            }
            setSubcategories(subcategoryData);
          }
        } else {
          message.error('Mahsulot ma\'lumotlarini olishda xatolik');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Ma\'lumotlarni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await axios.post('http://localhost:3000/api/cart', { productId: id });
      message.success('Mahsulot savatga qo\'shildi');
    } catch (error) {
      console.error('Error adding to cart:', error);
      message.error('Savatga qo\'shishda xatolik yuz berdi');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Title level={3}>Mahsulot topilmadi</Title>
      </div>
    );
  }

  return (
    <App>
      <div className="product-details-container">
        <Row gutter={[48, 24]}>
          {/* Left Column - Images */}
          <Col xs={24} md={12}>
            <div className="product-images">
              <div className="main-image">
                {product.images && product.images.length > 0 && (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="product-main-image"
                  />
                )}
              </div>
              <div className="thumbnail-images">
                {product.images && product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`${product.name} - ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </Col>

          {/* Right Column - Product Info */}
          <Col xs={24} md={12}>
            <div className="product-info-detailed">
              <div className="product-header">
                {product.brand && (
                  <Tag color="blue" className="brand-tag">
                    {product.brand.name}
                  </Tag>
                )}
                <Title level={2}>{product.name}</Title>
              </div>

              <div className="product-rating-section">
                <Rate disabled defaultValue={product.averageRating || 0} />
                <Text type="secondary">({product.totalRatings || 0} ta baho)</Text>
              </div>

              <div className="product-price-section">
                {product.discount_price !== product.price ? (
                  <>
                    <Text delete type="secondary" className="original-price">
                      {product.price.toLocaleString()} so'm
                    </Text>
                    <Title level={3} type="danger" className="discount-price">
                      {product.discount_price.toLocaleString()} so'm
                    </Title>
                    <Tag color="red">
                      {product.discount_percent}% chegirma
                    </Tag>
                  </>
                ) : (
                  <Title level={3} className="regular-price">
                    {product.price.toLocaleString()} so'm
                  </Title>
                )}
              </div>

              <Divider />

              <Descriptions title="Mahsulot haqida" column={1} bordered>
                <Descriptions.Item label="Brand">
                  {product.brand && (
                    <Tag color="blue">
                      {product.brand.name}
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Kategoriyalar">
                  {product.categories && product.categories.map((categoryId) => (
                    <Tag color="blue" key={categoryId} style={{ marginRight: 8 }}>
                      {categories[categoryId] || 'Yuklanmoqda...'}
                    </Tag>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="Subkategoriyalar">
                  {product.subcategories && product.subcategories.map((subcategoryId) => (
                    <Tag color="cyan" key={subcategoryId} style={{ marginRight: 8 }}>
                      {subcategories[subcategoryId] || 'Yuklanmoqda...'}
                    </Tag>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="Holati">
                  {product.stock > 0 ? (
                    <Tag color="success">Mavjud ({product.stock} dona)</Tag>
                  ) : (
                    <Tag color="error">Mavjud emas</Tag>
                  )}
                </Descriptions.Item>
                {product.specifications && product.specifications.length > 0 && product.specifications.map((spec, index) => (
                  <Descriptions.Item key={index} label={spec.name}>
                    {spec.value}
                  </Descriptions.Item>
                ))}
              </Descriptions>

              {product.description && (
                <div className="product-description">
                  <Title level={4}>Tavsif</Title>
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              )}

              <div className="product-actions">
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  size="large"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  block
                >
                  Savatga qo'shish
                </Button>
                <Button
                  icon={<HeartOutlined />}
                  size="large"
                  block
                >
                  Sevimlilarga qo'shish
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Similar Products Section */}
        {product.similarProducts && product.similarProducts.length > 0 && (
          <div className="similar-products" style={{ marginTop: '48px' }}>
            <Divider>
              <Title level={4}>O'xshash mahsulotlar</Title>
            </Divider>
            <Row gutter={[16, 16]}>
              {product.similarProducts.map((similarProduct) => (
                <Col xs={24} sm={12} md={8} lg={6} key={similarProduct._id}>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={similarProduct.name}
                        src={similarProduct.images[0]}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    }
                    onClick={() => window.location.href = `/product/${similarProduct._id}`}
                  >
                    <Card.Meta
                      title={similarProduct.name}
                      description={
                        <>
                          <div style={{ marginBottom: 8 }}>
                            {similarProduct.discount_price !== similarProduct.price ? (
                              <>
                                <Text delete type="secondary" style={{ fontSize: 14 }}>
                                  {similarProduct.price.toLocaleString()} so'm
                                </Text>
                                <br />
                                <Text type="danger" strong style={{ fontSize: 16 }}>
                                  {similarProduct.discount_price.toLocaleString()} so'm
                                </Text>
                                <Tag color="red" style={{ marginLeft: 8 }}>
                                  {similarProduct.discount_percent}% chegirma
                                </Tag>
                              </>
                            ) : (
                              <Text strong style={{ fontSize: 16 }}>
                                {similarProduct.price.toLocaleString()} so'm
                              </Text>
                            )}
                          </div>
                          <div>
                            <Tag color={similarProduct.stock > 0 ? 'success' : 'error'}>
                              {similarProduct.stock > 0 ? `${similarProduct.stock} dona mavjud` : 'Mavjud emas'}
                            </Tag>
                          </div>
                        </>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    </App>
  );
};

export default ProductDetails;
