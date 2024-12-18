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
      padding: '24px 3%',  // 减小边距，使用百分比
      maxWidth: '100%',    // 允许内容填充整个屏幕
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      {/* 标题区域 - 减小间距 */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '24px',
        padding: '0 5%'
      }}>
        <Title level={1} style={{ 
          fontSize: 'min(36px, calc(24px + 1vw))',  // 限制最大字体大小
          marginBottom: '12px'
        }}>
          {product.name}
        </Title>
        <Text type="secondary" style={{ 
          fontSize: 'min(16px, calc(14px + 0.2vw))',
          maxWidth: '100%',  // 允许文字填充容器
          display: 'inline-block',
          lineHeight: '1.6'
        }}>
          {product.description}
        </Text>
      </div>

      {/* 主要内容区域 - 调整间距和比例 */}
      <Row gutter={[24, 24]} style={{ margin: '0' }}>  {/* 减小栅格间距，移除外边距 */}
        {/* 左侧商品图片 */}
        <Col xs={24} md={12} style={{ padding: '12px' }}>  {/* 减小内边距 */}
          <div style={{ 
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <img 
              src={product.image_url} 
              alt={product.name} 
              style={{ 
                width: '100%',
                height: 'auto',
                maxHeight: 'min(600px, calc(300px + 20vw))',  // 更灵活的高度调整
                objectFit: 'contain'
              }} 
            />
          </div>
          
          {/* 商品详情标签页 */}
          <div style={{ 
            background: '#fff',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <Tabs defaultActiveKey="1" size="large">  {/* 增大标签页大小 */}
              <TabPane tab="商品详情" key="1">
                <div style={{ padding: '16px' }}>
                  <Title level={4} style={{ fontSize: 'min(20px, calc(16px + 0.3vw))' }}>
                    产品描述
                  </Title>
                  <Paragraph style={{ fontSize: 'min(16px, calc(14px + 0.2vw))' }}>
                    {product.description}
                  </Paragraph>
                  
                  <Divider />
                  
                  <Title level={4} style={{ fontSize: 'min(20px, calc(16px + 0.3vw))' }}>
                    规格参数
                  </Title>
                  <ul style={{ 
                    paddingLeft: '20px',
                    fontSize: 'min(16px, calc(14px + 0.2vw))'
                  }}>
                    <li>类别：{product.category}</li>
                    {product.features?.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </TabPane>
              <TabPane tab="评价" key="2">
                <div style={{ padding: '16px' }}>
                  <Text>暂无评价</Text>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </Col>

        {/* 右侧商品信息 */}
        <Col xs={24} md={12} style={{ padding: '12px' }}>
          <div style={{ 
            background: '#fff',
            padding: '24px',
            borderRadius: '8px',
            position: 'sticky',
            top: '24px',
            height: 'fit-content'  // 适应内容高度
          }}>
            <div style={{ marginBottom: '20px' }}>
              <Space size="large">
                <ShopOutlined style={{ fontSize: 'min(24px, calc(18px + 0.3vw))' }} />
                <Text strong style={{ fontSize: 'min(18px, calc(16px + 0.2vw))' }}>
                  {product.store_name}
                </Text>
              </Space>
            </div>

            {/* 调整价格显示 */}
            <div className="product-price" style={{ 
              marginBottom: '24px',
              fontSize: 'min(32px, calc(24px + 0.5vw))'  // 更大的价格字体
            }}>
              {renderPrice()}
            </div>

            <Divider />

            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ 
                display: 'block', 
                marginBottom: '12px',
                fontSize: 'min(18px, calc(16px + 0.2vw))'
              }}>
                数量
              </Text>
              <Space size="large">
                <InputNumber
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(value) => setQuantity(value || 1)}
                  style={{ 
                    width: 'min(150px, calc(120px + 2vw))',
                    height: '40px'
                  }}
                  size="large"
                />
                <Text type="secondary" style={{ 
                  fontSize: 'min(16px, calc(14px + 0.2vw))'
                }}>
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
              style={{ 
                height: '48px',
                fontSize: 'min(18px, calc(16px + 0.2vw))',
                marginBottom: '24px'
              }}
            >
              {product.stock <= 0 ? '暂时缺货' : '加入购物车'}
            </Button>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around',
              background: '#f8f8f8',
              padding: '16px',
              borderRadius: '8px'
            }}>
              <Space size="large">
                <Text type="secondary" style={{ fontSize: 'min(16px, calc(14px + 0.2vw))' }}>
                  销量: <Text strong>{product.sales}</Text>
                </Text>
              </Space>
              <Space size="large">
                <Text type="secondary" style={{ fontSize: 'min(16px, calc(14px + 0.2vw))' }}>
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