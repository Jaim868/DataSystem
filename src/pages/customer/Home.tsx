import React, { useState, useEffect, useMemo } from 'react';
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

// 新增分类接口定义
interface BaseCategory {
  name: string;
  icon: React.ReactNode;
}

interface SingleCategory extends BaseCategory {
  category: string;
}

interface MultiCategory extends BaseCategory {
  categories: string[];
}

type CategoryType = SingleCategory | MultiCategory;

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [stores, setStores] = useState<{ id: number; name: string; }[]>([]);
  const navigate = useNavigate();

  // 修改分类定义，添加类型注解
  const categories: CategoryType[] = useMemo(() => [
    { name: '鱼竿', icon: <CrownOutlined />, category: '鱼竿' },
    { name: '渔具', icon: <ShopOutlined />, categories: ['渔线', '鱼钩', '工具'] },
    { name: '饵料', icon: <FireOutlined />, category: '饵料' },
    { name: '服饰', icon: <SearchOutlined />, category: '服饰' }
  ], []);

  // 使用 useMemo 优化筛选逻辑
  const filteredProducts = useMemo(() => {
    if (loading) return [];
    
    let filtered = [...products];

    // 分类过滤
    if (selectedCategory) {
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category) {
        if ('categories' in category && category.categories) {
          // 如果是渔具分类，检查是否在子分类列表中
          filtered = filtered.filter(product => 
            category.categories.includes(product.category || '')
          );
        } else if ('category' in category) {
          // 其他分类直接比较
          filtered = filtered.filter(product => 
            product.category === category.category
          );
        }
      }
    }

    return filtered;
  }, [products, selectedCategory, loading, categories]);

  // 获取商品列表
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products';
      const params = new URLSearchParams();
      
      if (selectedStore) {
        params.append('store_id', selectedStore.toString());
      }
      
      if (selectedCategory) {
        const category = categories.find(cat => cat.name === selectedCategory);
        if (category) {
          if ('categories' in category && category.categories) {
            // 如果是渔具分类，传递子分类列表
            category.categories.forEach(cat => params.append('categories[]', cat));
          } else if ('category' in category) {
            // 其他分类直接传递
            params.append('category', category.category);
          }
        }
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const response = await axios.get(url);
      console.log('Products Response:', response.data); // 添加调试日志
      
      // 直接使用响应数据，不再进行额外的前端筛选
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('获取商品列表失败');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取商店列表
  const fetchStores = async () => {
    try {
      const response = await axios.get('/api/stores');
      console.log('Stores Response:', response.data); // 添加调试日志
      setStores(response.data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      message.error('获取商店列表失败');
      setStores([]);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    if (value.trim()) {
      // 如果有搜索内容，过滤商品
      const searchLower = value.toLowerCase().trim();
      const searchResults = products.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchLower);
        const descriptionMatch = product.description.toLowerCase().includes(searchLower);
        return nameMatch || descriptionMatch;
      });
      setProducts(searchResults);
    } else {
      // 如果搜索框清空，重新获取所有商品
      fetchProducts();
    }
    setSelectedCategory('');
  };

  // 处理分类选择
  const handleCategoryClick = (category: string) => {
    if (category === selectedCategory) {
      setSelectedCategory('');
      fetchProducts();
    } else {
      setSelectedCategory(category);
      setSearchText('');
      fetchProducts();
    }
  };

  // 处理商店选择
  const handleStoreChange = (value: number | null) => {
    setSelectedStore(value);
    setSearchText('');
    setSelectedCategory('');
    fetchProducts();
  };

  // 渲染商店选择器
  const renderStoreSelector = () => (
    <Card style={{ marginBottom: 24 }}>
      <Space>
        <Text strong>选择商店：</Text>
        <Select
          style={{ width: 200 }}
          placeholder="全部商店"
          onChange={handleStoreChange}
          allowClear
          value={selectedStore}
        >
          {stores.map(store => (
            <Option key={store.id} value={store.id}>{store.name}</Option>
          ))}
        </Select>
      </Space>
    </Card>
  );

  // 渲染商品列表
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
                    <Text type="secondary" ellipsis>{product.description}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Rate disabled defaultValue={product.rating} style={{ fontSize: 12 }} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="blue">{product.store_name}</Tag>
                      <Tag color="green">¥{product.price.toFixed(2)}</Tag>
                      <Tag color={product.stock > 0 ? 'orange' : 'red'}>
                        {product.stock > 0 ? `库存: ${product.stock}` : '缺货'}
                      </Tag>
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
          value={searchText}
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
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
                  borderRadius: '4px',
                  transition: 'all 0.3s'
                }}
                onClick={() => handleCategoryClick(category.name)}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {category.icon}
                </div>
                <div style={{ 
                  fontSize: '16px',
                  fontWeight: selectedCategory === category.name ? 'bold' : 'normal'
                }}>
                  {category.name}
                </div>
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