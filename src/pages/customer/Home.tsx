import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, Typography, Carousel, Divider, Tag, Rate, message, Input, Select, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShopOutlined, FireOutlined, CrownOutlined, SearchOutlined } from '@ant-design/icons';

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
  category: string;
  rating: number;
  store_id: number;
  store_name: string;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [stores, setStores] = useState<{ id: number; name: string; }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.error('Invalid products data:', response.data);
        message.error('获取商品数据格式错误');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await axios.get('/api/stores');
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
      message.error('获取商店列表失败');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleStoreChange = (value: number) => {
    setSelectedStore(value);
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    if (!product?.name || !product?.description) return false;
    
    const matchesSearch = searchText ? (
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase())
    ) : true;
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesStore = !selectedStore || product.store_id === selectedStore;
    
    return matchesSearch && matchesCategory && matchesStore;
  }) : [];

  const categories = [
    { name: '鱼竿', icon: <CrownOutlined /> },
    { name: '鱼线', icon: <FireOutlined /> },
    { name: '鱼饵', icon: <ShopOutlined /> },
    { name: '浮漂', icon: <SearchOutlined /> }
  ];

  const renderStoreSelector = () => (
    <Card style={{ marginBottom: 24 }}>
      <Space>
        <Text strong>选择商店：</Text>
        <Select
          style={{ width: 200 }}
          placeholder="全部商店"
          onChange={handleStoreChange}
          allowClear
        >
          {stores.map(store => (
            <Option key={store.id} value={store.id}>{store.name}</Option>
          ))}
        </Select>
      </Space>
    </Card>
  );

  const renderProductList = () => (
    <Row gutter={[24, 24]}>
      {loading ? (
        <Col span={24} style={{ textAlign: 'center' }}>
          <Spin size="large" />
        </Col>
      ) : filteredProducts.length === 0 ? (
        <Col span={24} style={{ textAlign: 'center' }}>
          <Text>暂无商品</Text>
        </Col>
      ) : (
        filteredProducts.map(product => (
          <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={<img alt={product.name} src={product.image_url} style={{ height: 200, objectFit: 'cover' }} />}
              onClick={() => navigate(`/customer/product/${product.id}`)}
            >
              <Card.Meta
                title={product.name}
                description={
                  <>
                    <Text type="secondary">{product.description}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Rate disabled defaultValue={product.rating} style={{ fontSize: 12 }} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="blue">{product.store_name}</Tag>
                      <Tag color="green">¥{product.price}</Tag>
                    </div>
                  </>
                }
              />
            </Card>
          </Col>
        ))
      )}
    </Row>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 24 }}>
        <Search
          placeholder="搜索商品"
          onSearch={handleSearch}
          style={{ maxWidth: 400, marginBottom: 24 }}
        />
        <Divider />
        <Row gutter={24}>
          {categories.map(category => (
            <Col key={category.name} span={6}>
              <div
                style={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  padding: '12px',
                  background: selectedCategory === category.name ? '#e6f7ff' : 'transparent',
                  borderRadius: '4px'
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

      {renderStoreSelector()}
      {renderProductList()}
    </div>
  );
};

export default Home;