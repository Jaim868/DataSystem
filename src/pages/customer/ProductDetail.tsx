import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, message, Spin, InputNumber, Tabs, Divider, Space, Tag } from 'antd';
import { ShoppingCartOutlined, ShopOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  stock: number;
  category: string;
  features: string[];
  rating: number;
  sales: number;
  store_id: number;
  store_name: string;
  discount: number;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedTab, setSelectedTab] = useState('1');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        if (response.data.data) {
          setProduct(response.data.data);
        } else {
          setProduct(response.data);
        }
      } catch (error) {
        console.error('获取商品详情失败:', error);
        message.error('获取商品详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) {
        message.error('商品信息不存在');
        return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
        message.error('请先登录');
        navigate('/login', { state: { from: `/customer/product/${product.id}` } });
        return;
    }

    setAddingToCart(true);
    try {
        const response = await axios.post('/api/cart', {
            product_id: product.id,
            quantity: quantity
        });
        
        if (response.data.success) {
            message.success('添加到购物车成功');
        } else {
            message.error(response.data.message || '添加失败');
            if (response.data.error === '用户未登录') {
                navigate('/login', { state: { from: `/customer/product/${product.id}` } });
            }
        }
    } catch (error: any) {
        console.error('Add to cart error:', error);
        if (error.response?.data?.error === '用户未登录') {
            message.error('请先登录');
            navigate('/login', { state: { from: `/customer/product/${product.id}` } });
        } else {
            message.error('添加到购物车失败');
        }
    } finally {
        setAddingToCart(false);
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
    return <div>商品不存在</div>;
  }

  const renderPrice = () => {
    if (!product || typeof product.price === 'undefined') {
      return null;
    }

    return (
      <div className="product-price" style={{ marginBottom: '24px' }}>
        {product.discount > 0 ? (
          <>
            <Text delete type="secondary" style={{ fontSize: '16px' }}>
              原价: ¥{product.price.toFixed(2)}
            </Text>
            <Title level={3} style={{ margin: '8px 0', color: '#ff4d4f' }}>
              优惠价: ¥{(product.price * (1 - (product.discount || 0) / 100)).toFixed(2)}
            </Title>
            <Tag color="red">优惠 {product.discount}% OFF</Tag>
          </>
        ) : (
          <Title level={3} style={{ margin: '8px 0', color: '#ff4d4f' }}>
            ¥{product.price.toFixed(2)}
          </Title>
        )}
      </div>
    );
  };

  return (
    <div className="product-detail" style={{ 
      padding: '0',  // 移除内边距
      maxWidth: '100%',
      margin: '0',
      minHeight: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 标题区域 */}
      <div style={{ 
        padding: '24px 5%',
        background: '#fff',
        marginBottom: '24px'
      }}>
        <Title level={1} style={{ 
          fontSize: 'min(36px, calc(24px + 1vw))',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          {product.name}
        </Title>
        <Text type="secondary" style={{ 
          fontSize: 'min(16px, calc(14px + 0.2vw))',
          display: 'block',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          {product.description}
        </Text>
      </div>

      {/* 主要内容区域 */}
      <Row gutter={[24, 24]} style={{ margin: '0', flex: 1 }}>
        {/* 左侧商品图片和详情 */}
        <Col xs={24} md={14} lg={16} style={{ padding: '0 12px' }}>
          <div style={{ 
            background: '#fff',
            marginBottom: '24px'
          }}>
            <img 
              src={product.image_url} 
              alt={product.name} 
              style={{ 
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain'
              }} 
            />
          </div>

          {/* 商品详情标签页 */}
          <div style={{ 
            background: '#fff',
            padding: '24px'
          }}>
            <Tabs defaultActiveKey="1" size="large" className="product-detail-tabs">
              <TabPane tab="商品详情" key="1">
                <div style={{ padding: '16px 0' }}>
                  <Title level={4}>产品描述</Title>
                  <Paragraph>
                    {product.description}
                  </Paragraph>
                  
                  <Divider />
                  
                  <Title level={4}>规格参数</Title>
                  <ul className="product-detail-features">
                    <li>类别：{product.category}</li>
                    {product.features?.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </TabPane>
              <TabPane tab="评价" key="2">
                <div style={{ padding: '16px 0' }}>
                  <Text>暂无评价</Text>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </Col>

        {/* 右侧商品信息 */}
        <Col xs={24} md={10} lg={8} style={{ padding: '0 12px' }}>
          <div style={{ 
            background: '#fff',
            padding: '24px',
            position: 'sticky',
            top: '24px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <Space size="large">
                <ShopOutlined style={{ fontSize: '24px' }} />
                <Text strong style={{ fontSize: '18px' }}>
                  {product.store_name}
                </Text>
              </Space>
            </div>

            <div className="product-price" style={{ marginBottom: '24px' }}>
              {renderPrice()}
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ 
                display: 'block', 
                marginBottom: '12px',
                fontSize: '16px'
              }}>
                数量
              </Text>
              <Space size="large">
                <InputNumber
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(value) => setQuantity(value || 1)}
                  style={{ width: '120px' }}
                  size="large"
                />
                <Text type="secondary">
                  库存: {product.stock}
                </Text>
              </Space>
            </div>

            <Button 
              type="primary" 
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={handleAddToCart}
              loading={addingToCart}
              disabled={loading || !product}
              block
              className="buy-button"
            >
              {product.stock <= 0 ? '暂时缺货' : '加入购物车'}
            </Button>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around',
              background: '#f8f8f8',
              padding: '16px',
              borderRadius: '8px',
              marginTop: '24px'
            }}>
              <Space size="large">
              </Space>
              <Space size="large">
                <Text type="secondary">
                  评分: <Text strong>{product.rating}分</Text>
                </Text>
              </Space>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetail;