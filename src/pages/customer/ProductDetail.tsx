import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Image, Tag, Divider, message, Rate } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  rating: number;
  stock: number;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 模拟商品数据库
  const mockProducts: Product[] = [
    {
      id: 1,
      name: '碳素鱼竿',
      price: 299,
      description: '高品质碳素材料，轻便耐用，适合各种钓鱼场景。特点：\n- 超轻碳素材质\n- 伸缩便携设计\n- 防滑手柄\n- 优质导环',
      category: '鱼竿',
      imageUrl: '/images/products/fishing_rod_carbon.jpg',
      rating: 4.5,
      stock: 50
    },
    {
      id: 2,
      name: '专业渔线',
      price: 49,
      description: '高强度尼龙材质渔线，韧性好，不易断裂',
      category: '鱼线',
      imageUrl: '/images/products/fishing_line.jpg',
      rating: 4.3,
      stock: 100
    },
    {
      id: 3,
      name: '精钢鱼钩',
      price: 29,
      description: '采用优质精钢，锋利持久，防锈耐用',
      category: '鱼钩',
      imageUrl: '/images/products/fishing_hook.jpg',
      rating: 4.4,
      stock: 200
    },
    {
      id: 4,
      name: '渔具包',
      price: 159,
      description: '大容量防水渔具包，多层收纳，实用耐用',
      category: '其他配件',
      imageUrl: '/images/products/fishing_bag.jpg',
      rating: 4.6,
      stock: 30
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const currentProduct = mockProducts.find(p => p.id === Number(id));
      if (currentProduct) {
        setProduct(currentProduct);
        
        // 更智能的推荐逻辑
        const getRecommendations = (product: Product) => {
          // 首先尝试获取同类别的商品
          let recommendations = mockProducts
            .filter(p => p.category === product.category && p.id !== product.id);
          
          // 如果同类别商品不足3个，添加其他类别的商品
          if (recommendations.length < 3) {
            const otherProducts = mockProducts
              .filter(p => p.category !== product.category && p.id !== product.id)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3 - recommendations.length);
            
            recommendations = [...recommendations, ...otherProducts];
          }
          
          return recommendations.slice(0, 3);
        };

        setRelatedProducts(getRecommendations(currentProduct));
      } else {
        navigate('/customer/home');
        message.error('商品不存在');
      }
      setLoading(false);
    }, 500);
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cartItems.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
      localStorage.setItem('cart', JSON.stringify(cartItems));
      message.success('已增加商品数量');
    } else {
      cartItems.push({ ...product, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(cartItems));
      message.success('已添加到购物车');
    }

    // 触发自定义事件通知布局组件更新购物车数量
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading || !product) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 顶部导航区 */}
      <div 
        style={{ 
          position: 'sticky', 
          top: 0, 
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          padding: '16px 24px',
          zIndex: 100,
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Text style={{ fontSize: 18 }}>{product?.name}</Text>
          </Col>
          <Col>
            <Button 
              type="primary"
              onClick={handleAddToCart}
              style={{
                borderRadius: 20,
                height: 36,
                background: '#000',
                border: 'none'
              }}
            >
              加入购物车
            </Button>
          </Col>
        </Row>
      </div>

      {/* 主要内容区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 商品标题区域 */}
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 24px 40px',
          background: 'linear-gradient(180deg, #fff 0%, #f5f5f7 100%)',
          flex: '0 0 auto'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Title level={1} style={{ 
              fontSize: 56, 
              marginBottom: 16,
              fontWeight: 600,
              background: 'linear-gradient(to right, #1a1a1a, #4a4a4a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {product?.name}
            </Title>
            <Text style={{ 
              fontSize: 24, 
              color: '#86868b',
              display: 'block',
              marginBottom: 24
            }}>
              突破性能 • 创新设计
            </Text>
            <Text style={{ 
              fontSize: 40,
              fontWeight: 600,
              color: '#1d1d1f'
            }}>
              ¥{product?.price}
            </Text>
          </motion.div>
        </div>

        {/* 商品主图区域 */}
        <div style={{ 
          background: '#f5f5f7',
          padding: '0 24px 80px',
          flex: '1 0 auto'
        }}>
          <div style={{ 
            maxWidth: 1200,  // 增加最大宽度
            margin: '0 auto',
            padding: '0 20px'  // 添加小的内边距以防止内容贴边
          }}>
            <Row 
              gutter={[100, 48]}  // 将横向间距从 60 增加到 100
              justify="center" 
              align="middle"
              style={{
                margin: '0 -20px'  // 抵消 Row 的默认外边距
              }}
            >
              <Col xs={24} md={15}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  <img
                    src={product?.imageUrl}
                    alt={product?.name}
                    style={{ 
                      width: '100%',
                      height: 'auto',
                      borderRadius: 30,
                      boxShadow: '0 50px 100px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </motion.div>
              </Col>
              
              {/* 商品信息区域 */}
              <Col xs={24} md={9}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ 
                    y: -5,
                    transition: { duration: 0.3 }
                  }}
                  transition={{ duration: 1, delay: 0.4 }}
                >
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    padding: '40px',
                    borderRadius: 30,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
                  }}>
                    <Title level={3} style={{ marginBottom: 24 }}>产品特点</Title>
                    <div style={{ marginBottom: 24 }}>
                      <Rate disabled defaultValue={product?.rating} />
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        {product?.rating} 分
                      </Text>
                    </div>
                    <Text style={{ 
                      whiteSpace: 'pre-line',
                      fontSize: 16,
                      lineHeight: '1.8',
                      color: '#1d1d1f'
                    }}>
                      {product?.description}
                    </Text>
                    <Divider />
                    <div style={{ marginBottom: 24 }}>
                      <Text type="secondary" style={{ fontSize: 16 }}>
                        库存: {product?.stock}件
                      </Text>
                    </div>
                    <Button 
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      onClick={handleAddToCart}
                      block
                      className="hover-button"
                      style={{
                        height: 50,
                        fontSize: 16,
                        borderRadius: 25,
                        background: '#000',
                        border: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      加入购物车
                    </Button>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </div>
        </div>

        {/* 相关商品区域 */}
        <div style={{ 
          padding: '80px 24px',
          background: '#fff',
          flex: '0 0 auto'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{ 
              textAlign: 'center', 
              marginBottom: 60,
              fontSize: 40
            }}>
              更多推荐
            </Title>
            <Row gutter={[32, 32]}>
              {relatedProducts.map(item => (
                <Col xs={24} sm={12} md={8} key={item.id}>
                  <motion.div
                    whileHover={{ 
                      y: -10,
                      scale: 1.03,
                      transition: { duration: 0.3 }
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card
                      hoverable
                      className="hover-card"
                      cover={
                        <div style={{ 
                          height: 200,  // 固定高度
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f5f5f7',
                          overflow: 'hidden'  // 添加溢出隐藏
                        }}>
                          <img 
                            alt={item.name} 
                            src={item.imageUrl}
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'  // 修改为 cover 以填充整个区域
                            }}
                          />
                        </div>
                      }
                      onClick={() => navigate(`/customer/product/${item.id}`)}
                      style={{ 
                        borderRadius: 20,
                        border: 'none',
                        transform: 'perspective(1000px) rotateX(0deg)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <Card.Meta
                        title={
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8
                          }}>
                            <Text style={{ fontSize: 18 }}>{item.name}</Text>
                            <Text style={{ 
                              fontSize: 18,
                              fontWeight: 600,
                              color: '#1d1d1f'
                            }}>
                              ¥{item.price}
                            </Text>
                          </div>
                        }
                        description={
                          <Rate disabled defaultValue={item.rating} style={{ fontSize: 12 }} />
                        }
                      />
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;