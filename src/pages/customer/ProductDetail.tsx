import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Divider, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import axios from 'axios';

const { Text, Title } = Typography;

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  features: string[];
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      if (!id) return;
      console.log('Fetching product details for ID:', id);
      
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || '获取商品详情失败');
      }
      
      if (!data) {
        throw new Error('未获取到商品数据');
      }
      
      setProduct(data);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('获取商品详情失败');
      }
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        message.error('请先登录');
        navigate('/login');
        return;
      }

      const response = await axios.post('/api/cart', {
        userId,
        productId: product?.id,
        quantity: 1
      });

      if (response.data.success) {
        message.success('已添加到购物车');
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        throw new Error('添加到购物车失败');
      }
    } catch (error) {
      message.error('添加到购物车失败');
      console.error(error);
    }
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 18 }}>{product?.name}</Text>
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
        </div>
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
              突破性能  创新设计
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
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center'
            }}>
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
            </div>
          </div>
        </div>

        {/* 商品信息区域 */}
        <div style={{ 
          padding: '80px 24px',
          background: '#fff',
          flex: '0 0 auto'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Title level={3} style={{ marginBottom: 24 }}>产品特点</Title>
            <div style={{ marginBottom: 24 }}>
              <Text style={{ 
                whiteSpace: 'pre-line',
                fontSize: 16,
                lineHeight: '1.8',
                color: '#1d1d1f'
              }}>
                {product?.description}
              </Text>
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;