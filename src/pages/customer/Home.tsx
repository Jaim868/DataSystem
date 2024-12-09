import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, Typography, Carousel, Divider, Tag, Rate, message, Input, Select, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShopOutlined, FireOutlined, CrownOutlined, SearchOutlined, RocketOutlined, ThunderboltOutlined, CompassOutlined, AimOutlined, AppstoreOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  stock: number;
  sales: number;
  rating: number;
  category: string;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 从 URL 获取分类参数
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    setCurrentCategory(category || '');
    fetchProducts(category || '');
  }, [location.search]);

  const fetchProducts = async (category: string) => {
    try {
      const response = await axios.get('/api/products' + (category ? `?category=${category}` : ''));
      setProducts(response.data);
    } catch (error) {
      message.error('获取商品列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 处理分类点击
  const handleCategoryClick = (categoryName: string) => {
    if (currentCategory === categoryName) {
      // 如果点击当前分类，则清除筛选
      navigate('/customer/home');
    } else {
      navigate(`/customer/home?category=${categoryName}`);
    }
  };

  const categories = [
    { name: '鱼竿', icon: <RocketOutlined style={{ fontSize: '24px', color: '#40a9ff' }} /> },
    { name: '鱼线', icon: <ThunderboltOutlined style={{ fontSize: '24px', color: '#73d13d' }} /> },
    { name: '鱼漂', icon: <CompassOutlined style={{ fontSize: '24px', color: '#ffc53d' }} /> },
    { name: '鱼钩', icon: <AimOutlined style={{ fontSize: '24px', color: '#ff7a45' }} /> },
    { name: '配件', icon: <AppstoreOutlined style={{ fontSize: '24px', color: '#b37feb' }} /> },
  ];

  const carouselImages = [
    '/images/banner1.jpg',
    '/images/banner2.jpg',
    '/images/banner3.jpg',
  ];

  // 搜索处理函数
  const handleSearch = (value: string) => {
    setSearchText(value.trim());
  };

  const handleSort = (value: string) => {
    setSortBy(value);
  };

  // 过滤和排序商品
  const filteredAndSortedProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'sales':
          return b.sales - a.sales;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  // 渲染商品列表部分
  const renderProductList = () => {
    // 如果有搜索文本，只显示搜索结果
    if (searchText) {
      return (
        <div>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text>搜索结果: </Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>{searchText}</Tag>
              <Tag 
                color="default" 
                style={{ marginLeft: 8, cursor: 'pointer' }}
                onClick={() => setSearchText('')}
              >
                清除搜索
              </Tag>
            </div>
            <Select
              defaultValue="default"
              style={{ width: 120 }}
              onChange={handleSort}
              size="middle"
            >
              <Option value="default">默认排序</Option>
              <Option value="price-asc">价格从低到高</Option>
              <Option value="price-desc">价格从高到低</Option>
              <Option value="sales">销量优先</Option>
              <Option value="rating">评分优先</Option>
            </Select>
          </div>

          <Row gutter={[16, 24]}>
            {filteredAndSortedProducts.map(product => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <div style={{ 
                      height: '200px', 
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5'
                    }}>
                      <img 
                        alt={product.name} 
                        src={product.image_url} 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/customer/product/${product.id}`)}
                >
                  <Card.Meta
                    title={product.name}
                    description={
                      <>
                        <div style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '16px' }}>
                          ¥{Number(product.price).toFixed(2)}
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <Tag color="blue">{product.category}</Tag>
                          <Text type="secondary" style={{ marginLeft: '8px' }}>
                            库存: {product.stock}
                          </Text>
                        </div>
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {filteredAndSortedProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text type="secondary">没有找到相关商品</Text>
            </div>
          )}
        </div>
      );
    }

    // 如果没有搜索文本，显示正常的商品展示
    return (
      <>
        {/* 商品推荐区域 */}
        <Card 
          title={
            <Title level={4} style={{ margin: 0 }}>
              <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
              今日推荐
            </Title>
          }
          style={{ marginBottom: '24px' }}
        >
          <Row gutter={[16, 16]}>
            {products.slice(0, 3).map(product => (
              <Col key={product.id} span={8}>
                <Card
                  hoverable
                  className="product-card"
                  bodyStyle={{ padding: '16px' }}
                  style={{ background: '#fafafa' }}
                  cover={
                    <div style={{ position: 'relative' }}>
                      <img
                        alt={product.name}
                        src={product.image_url}
                        style={{ 
                          height: '200px', 
                          width: '100%', 
                          objectFit: 'cover',
                          transition: 'transform 0.3s'
                        }}
                      />
                      {product.stock < 10 && (
                        <Tag 
                          className="stock-warning"
                          color="red" 
                          style={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          仅剩{product.stock}件
                        </Tag>
                      )}
                      {product.sales > 100 && (
                        <Tag 
                          color="gold" 
                          style={{ 
                            position: 'absolute', 
                            top: 8, 
                            left: 8,
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          热销爆款
                        </Tag>
                      )}
                    </div>
                  }
                  onClick={() => navigate(`/customer/product/${product.id}`)}
                >
                  <Card.Meta
                    title={
                      <Space direction="vertical" size={0}>
                        <Text strong>{product.name}</Text>
                        <Text type="danger" strong>¥{Number(product.price).toFixed(2)}</Text>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Text type="secondary" ellipsis>{product.description}</Text>
                        <div>
                          <Rate disabled defaultValue={product.rating} style={{ fontSize: 12 }} />
                          <Text type="secondary" style={{ marginLeft: 8 }}>
                            已售{product.sales}件
                          </Text>
                        </div>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 热销商品 */}
        <Divider orientation="left" style={{ margin: '40px 0 24px' }}>
          <Space>
            <FireOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />
            <Title level={3} style={{ margin: 0 }}>热销商品</Title>
          </Space>
        </Divider>
        <Row gutter={[16, 16]}>
          {products.sort((a, b) => b.sales - a.sales).slice(0, 4).map(product => (
            <Col key={product.id} xs={24} sm={12} md={6}>
              <Card
                hoverable
                cover={
                  <img
                    alt={product.name}
                    src={product.image_url}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                }
                onClick={() => navigate(`/customer/product/${product.id}`)}
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <>
                      <div style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '16px' }}>
                        ¥{Number(product.price).toFixed(2)}
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <Text type="secondary">已售 {product.sales} 件</Text>
                        <Rate disabled defaultValue={product.rating} style={{ fontSize: '12px', marginLeft: '8px' }} />
                      </div>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* 全部商品 */}
        <div>
          <Title level={3}>
            <CrownOutlined style={{ marginRight: '8px' }} />
            全部商品
          </Title>
          <Row gutter={[16, 24]}>
            {products.map(product => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <div style={{ 
                      height: '200px', 
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5'
                    }}>
                      <img 
                        alt={product.name} 
                        src={product.image_url} 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/customer/product/${product.id}`)}
                >
                  <Card.Meta
                    title={product.name}
                    description={
                      <>
                        <div style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '16px' }}>
                          ¥{Number(product.price).toFixed(2)}
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <Tag color="blue">{product.category}</Tag>
                          <Text type="secondary" style={{ marginLeft: '8px' }}>
                            库存: {product.stock}
                          </Text>
                        </div>
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 搜索工具栏 */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
        <Search
          placeholder="搜索您感兴趣的渔具..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          style={{ 
            width: '60%', 
            minWidth: '300px',
            maxWidth: '800px'
          }}
          onSearch={handleSearch}
        />
      </div>

      {/* 轮播图 */}
      <Carousel 
        autoplay 
        effect="fade"
        style={{ marginBottom: '24px' }}
      >
        {carouselImages.map((image, index) => (
          <div key={index}>
            <div style={{ 
              height: '400px', 
              background: 'linear-gradient(45deg, #f5f5f5, #ffffff)',
              position: 'relative' 
            }}>
              <img
                src={image}
                alt={`Banner ${index + 1}`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  filter: 'brightness(0.9)'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#fff',
                textAlign: 'center',
                width: '80%',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>
                <Title level={2} style={{ color: '#fff', marginBottom: '16px' }}>
                  精选渔具，品质保证
                </Title>
                <Text style={{ color: '#fff', fontSize: '18px' }}>
                  专业渔具，助您钓获大鱼
                </Text>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* 分类导航 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-around" align="middle">
          {categories.map((category, index) => (
            <Col key={index}>
              <div
                className={`category-item ${currentCategory === category.name ? 'active-category' : ''}`}
                style={{ 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  padding: '12px 24px',
                  color: currentCategory === category.name ? '#1890ff' : 'inherit'
                }}
                onClick={() => handleCategoryClick(category.name)}
              >
                {category.icon}
                <div style={{ marginTop: '8px' }}>{category.name}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 使用条件渲染函数 */}
      {renderProductList()}
    </div>
  );
};

export default Home;