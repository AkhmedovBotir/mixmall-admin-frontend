import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Space,
  Button,
  Input,
  Select,
  Typography,
  Tag,
  Pagination,
  message,
  Spin
} from 'antd';
import {
  ShoppingCartOutlined,
  SearchOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;
const { Option } = Select;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState({});
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [priceRange, setPriceRange] = useState(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, searchQuery, currentPage]);

  const fetchProducts = async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: params.page || currentPage,
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedBrand && { brand: selectedBrand }),
        ...(searchQuery && { search: searchQuery }),
        ...(priceRange && { 
          minPrice: priceRange[0],
          maxPrice: priceRange[1]
        }),
      });

      const response = await axios.get(`http://localhost:3000/api/products?${queryParams}`);
      if (response.data?.products) {
        setProducts(response.data.products);
        setTotalProducts(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Mahsulotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/categories');
      if (response.data?.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/brands');
      if (response.data?.success) {
        setBrands(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      setLoadingProducts(prev => ({ ...prev, [productId]: true }));
      const response = await axios.post('http://localhost:3000/api/cart/add', {
        productId,
        quantity: 1
      });
      if (response.data?.success) {
        message.success('Mahsulot savatga qo\'shildi');
        // Cart counter ni yangilash uchun event yuborish
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: response.data.cart.items.length
        }));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        message.error('Iltimos, avval tizimga kiring');
      } else {
        message.error('Mahsulotni savatga qo\'shishda xatolik');
      }
    } finally {
      setLoadingProducts(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleBrandChange = (value) => {
    setSelectedBrand(value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Filters */}
        <Space wrap>
          <Input
            placeholder="Mahsulot qidirish"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          
          <Select
            style={{ width: 200 }}
            placeholder="Kategoriya tanlang"
            allowClear
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            {categories.map((category) => (
              <Option key={category._id} value={category._id}>
                {category.name}
              </Option>
            ))}
          </Select>

          <Select
            style={{ width: 200 }}
            placeholder="Brend tanlang"
            allowClear
            value={selectedBrand}
            onChange={handleBrandChange}
          >
            {brands.map((brand) => (
              <Option key={brand._id} value={brand._id}>
                {brand.name}
              </Option>
            ))}
          </Select>
        </Space>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Text>Mahsulotlar topilmadi</Text>
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {products.map((product) => (
                <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          alt={product.name}
                          src={product.images[0]}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    }
                  >
                    <Card.Meta
                      title={product.name}
                      description={
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            {product.discount_price < product.price ? (
                              <>
                                <Text delete type="secondary">
                                  {product.price.toLocaleString()} so'm
                                </Text>
                                <br />
                                <Text type="danger" strong>
                                  {product.discount_price.toLocaleString()} so'm
                                </Text>
                                <Tag color="red">
                                  {product.discount_percent}% chegirma
                                </Tag>
                              </>
                            ) : (
                              <Text strong>
                                {product.price.toLocaleString()} so'm
                              </Text>
                            )}
                          </div>
                          {product.brand && (
                            <Tag color="blue">{product.brand.name}</Tag>
                          )}
                          <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            onClick={() => handleAddToCart(product._id)}
                            loading={loadingProducts[product._id]}
                            disabled={product.stock <= 0}
                            block
                          >
                            {product.stock > 0 ? 'Savatga qo\'shish' : 'Sotuvda yo\'q'}
                          </Button>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={currentPage}
                total={totalProducts}
                pageSize={12}
                onChange={(page) => {
                  setCurrentPage(page);
                  fetchProducts({ page });
                }}
                showTotal={(total) => `Jami ${total} ta mahsulot`}
              />
            </div>
          </>
        )}
      </Space>
    </div>
  );
};

export default Products;
