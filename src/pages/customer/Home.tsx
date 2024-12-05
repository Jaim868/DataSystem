import React from 'react';
import { Card, Row, Col, Button, Image, Tag, message, Typography, Carousel } from 'antd';
import { ShoppingCartOutlined, FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Paragraph, Text } = Typography;

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  features?: string[];
  stock: number;
  sales: number;
}

const Home = () => {
  const navigate = useNavigate();
  
  const banners = [
    'https://via.placeholder.com/1200x300/FF4D4F/FFFFFF?text=渔具特惠',
    'https://via.placeholder.com/1200x300/1890FF/FFFFFF?text=新品上市',
    'https://via.placeholder.com/1200x300/52C41A/FFFFFF?text=限时折扣',
  ];

  const products: Product[] = [
    {
      id: 1,
      name: '碳素鱼竿',
      price: 299,
      description: '高品质碳素材料，轻便耐用，适合各种钓鱼场景',
      category: '鱼竿',
      imageUrl: '/images/products/fishing_rod_carbon.jpg',
      features: ['超轻碳素材质', '伸缩便携设计', '防滑手柄'],
      stock: 50,
      sales: 120
    },
    {
      id: 2,
      name: '专业级渔线',
      price: 59,
      description: '日本进口材料，超强韧性，不易断裂',
      category: '鱼线',
      imageUrl: 'https://via.placeholder.com/200x200?text=专业渔线',
      features: ['超强韧性', '防缠绕', '耐磨损'],
      stock: 200,
      sales: 300
    },
    {
      id: 3,
      name: '自动钓鱼竿套装',
      price: 899,
      description: '智能感应，自动收线，适合新手和专业钓友',
      category: '鱼竿',
      imageUrl: 'https://via.placeholder.com/200x200?text=自动钓鱼竿',
      features: ['自动收线', '智能感应', '配件齐全'],
      stock: 30,
      sales: 80
    },
    {
      id: 4,
      name: '高灵敏鱼漂套装',
      price: 45,
      description: '灵敏度高，夜光设计，多种规格可选',
      category: '鱼漂',
      imageUrl: 'https://via.placeholder.com/200x200?text=鱼漂套装',
      features: ['夜光设计', '多规格', '高灵敏度'],
      stock: 150,
      sales: 200
    },
    {
      id: 5,
      name: '专业鱼钩套装',
      price: 89,
      description: '日本进口钢材，锋利耐用，多种型号',
      category: '鱼钩',
      imageUrl: 'https://via.placeholder.com/200x200?text=鱼钩套装',
      features: ['锋利持久', '防锈处理', '多型号可选'],
      stock: 100,
      sales: 180
    },
    {
      id: 6,
      name: '多功能渔具包',
      price: 159,
      description: '大容量设计，防水材质，多层收纳',
      category: '配件',
      imageUrl: 'https://via.placeholder.com/200x200?text=渔具包',
      features: ['防水设计', '大容量', '多层收纳'],
      stock: 40,
      sales: 90
    },
    {
      id: 7,
      name: '电子咬钩报警器',
      price: 129,
      description: '灵敏度可调，防水设计，声光报警',
      category: '配件',
      imageUrl: 'https://via.placeholder.com/200x200?text=报警器',
      features: ['声光报警', '防水设计', '灵敏可调'],
      stock: 60,
      sales: 150
    },
    {
      id: 8,
      name: '折叠钓鱼椅',
      price: 199,
      description: '轻便折叠，承重强，带置物架',
      category: '配件',
      imageUrl: 'https://via.placeholder.com/200x200?text=钓鱼椅',
      features: ['轻便折叠', '高承重', '带置物架'],
      stock: 45,
      sales: 75
    }
  ];

  const addToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation(); // 阻止事件冒泡
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({...product, quantity: 1});
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // 触发自定义事件通知布局组件更新购物车数量
    window.dispatchEvent(new Event('cartUpdated'));
    
    message.success('已添加到购物车');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* 轮播图 */}
      <Carousel autoplay style={{ marginBottom: 24 }}>
        {banners.map((banner, index) => (
          <div key={index}>
            <img src={banner} alt={`banner${index}`} style={{ width: '100%', height: 300 }} />
          </div>
        ))}
      </Carousel>

      {/* 分类标题 */}
      <Title level={3} style={{ marginBottom: 24 }}>
        <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
        热销商品
      </Title>

      {/* 商品列表 */}
      <Row gutter={[24, 24]}>
        {products.map(product => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%' }}
            >
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f5f7',
                    overflow: 'hidden',
                    borderRadius: '20px 20px 0 0'
                  }}>
                    <img
                      alt={product.name}
                      src={product.imageUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                }
                onClick={() => navigate(`/customer/product/${product.id}`)}
                style={{ 
                  height: '100%',  // 使卡片填充整个容器
                  borderRadius: 20,
                  border: 'none',
                  background: '#fff',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                bodyStyle={{
                  flex: 1,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  height: '24px'
                }}>
                  <Text 
                    strong 
                    style={{ 
                      fontSize: 16,
                      maxWidth: '70%',
                      color: '#1a1a1a'
                    }}
                    ellipsis
                  >
                    {product.name}
                  </Text>
                  <Text 
                    style={{ 
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#ff4d4f'
                    }}
                  >
                    ¥{product.price}
                  </Text>
                </div>
                
                <Paragraph 
                  type="secondary" 
                  ellipsis={{ rows: 2 }}
                  style={{ 
                    fontSize: 14,
                    margin: '0 0 12px',
                    height: '42px',
                    color: '#666'
                  }}
                >
                  {product.description}
                </Paragraph>

                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: 8,
                  height: '28px',
                  marginBottom: '12px'
                }}>
                  {product.features?.slice(0, 3).map((feature, index) => (
                    <Tag 
                      key={index} 
                      style={{ 
                        margin: 0,
                        borderRadius: 4,
                        padding: '2px 8px',
                        background: '#f5f5f7',
                        border: 'none',
                        color: '#666'
                      }}
                    >
                      {feature}
                    </Tag>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto',
                  paddingTop: 12,
                  borderTop: '1px solid #f0f0f0',
                  height: '42px'
                }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      库存: {product.stock}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      销量: {product.sales}
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    size="small"
                    onClick={(e) => addToCart(e, product)}
                    style={{
                      borderRadius: 15,
                      height: 30,
                      padding: '0 12px',
                      background: '#000',
                      border: 'none'
                    }}
                  >
                    加入购物车
                  </Button>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* 底部信息 */}
      <Card style={{ marginTop: 24, marginBottom: 24, textAlign: 'center' }}>
        <Title level={4}>关于我们</Title>
        <Paragraph>
          专业渔具销售20年，提供优质渔具和专业服务。
          我们的产品均经过严格质量把关，确保每一位钓友都能获得最好的钓鱼体验。
        </Paragraph>
      </Card>
    </div>
  );
};

export default Home; 