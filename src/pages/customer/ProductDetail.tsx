import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Image, Tag, Divider, message, Rate, Space } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  rating: number;
  stock: number;
  image: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 模拟所有商品数据
  const mockProducts: Product[] = [
    {
      id: 1,
      name: '碳素超轻鱼竿',
      price: 299,
      description: '高品质碳素材料，轻便耐用，适合各种钓鱼场景。特点：\n- 超轻碳素材质\n- 伸缩便携设计\n- 防滑手柄\n- 优质导环',
      category: '鱼竿',
      rating: 4.5,
      stock: 50,
      image: '/images/products/fishing_rod_carbon.jpg'
    },
    {
      id: 2,
      name: '专业级渔线',
      price: 59,
      description: '日本进口材料，超强韧性，不易断裂。特点：\n- 超强韧性\n- 防缠绕设计\n- 耐磨损\n- 多种规格',
      category: '鱼线',
      rating: 4.3,
      stock: 100,
      image: '/images/products/fishing_line_pro.jpg'
    },
    {
      id: 3,
      name: '自动钓鱼竿套装',
      price: 899,
      description: '智能感应，自动收线，适合新手和专业钓友。特点：\n- 自动收线\n- 智能感应\n- 配件齐全\n- 使用方便',
      category: '鱼竿',
      rating: 4.4,
      stock: 30,
      image: 'fishing_rod_auto.jpg'
    },
    // ... 其他商品数据
  ];

  useEffect(() => {
    // 模拟API请求
    setLoading(true);
    setTimeout(() => {
      // 根据 id 查找对应商品
      const currentProduct = mockProducts.find(p => p.id === Number(id));
      if (currentProduct) {
        setProduct(currentProduct);
        // 获取同类别的相关商品
        const related = mockProducts.filter(p => 
          p.category === currentProduct.category && p.id !== currentProduct.id
        ).slice(0, 4);
        setRelatedProducts(related);
      }
      setLoading(false);
    }, 500);
  }, [id]);  // 当 id 变化时重新获取数据

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
  };

  if (loading || !product) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '40px 16px',
      minHeight: 'calc(100vh - 64px)'
    }}>
      {/* 标题和价格区域 */}
      <div style={{ marginBottom: 40 }}>
        <Title level={1} style={{ fontSize: '48px', marginBottom: 16 }}>
          {product.name}
        </Title>
        <Text style={{ fontSize: '18px', color: '#666' }}>
          从 ¥{product.price} 起
        </Text>
      </div>

      {/* 主要内容区域 */}
      <Row gutter={[32, 32]} align="stretch">
        {/* 左侧产品图片 */}
        <Col xs={24} md={15}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              alt={product.name}
              src={product.image}
              style={{ 
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
                borderRadius: '12px'
              }}
            />
          </motion.div>
        </Col>

        {/* 右侧产品信息 */}
        <Col xs={24} md={9}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card bordered={false} style={{ background: '#f5f5f7' }}>
              <Title level={3} style={{ marginBottom: 24 }}>型号。哪一款最适合你？</Title>
              
              {/* 产品选项 */}
              <div style={{ marginBottom: 24 }}>
                <Card
                  hoverable
                  style={{ 
                    marginBottom: 16,
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => message.success('已选择标准版')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong style={{ fontSize: '16px' }}>{product.name} 标准版</Text>
                      <div style={{ color: '#666', marginTop: 4 }}>标准配置</div>
                    </div>
                    <Text strong>¥{product.price}</Text>
                  </div>
                </Card>

                <Card
                  hoverable
                  style={{ 
                    marginBottom: 16,
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => message.success('已选择高配版')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong style={{ fontSize: '16px' }}>{product.name} 高配版</Text>
                      <div style={{ color: '#666', marginTop: 4 }}>升级配置</div>
                    </div>
                    <Text strong>¥{(product.price * 1.2).toFixed(2)}</Text>
                  </div>
                </Card>
              </div>

              {/* 库存和评分信息 */}
              <div style={{ marginBottom: 24 }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text strong>库存状态</Text>
                    <div style={{ color: '#666', marginTop: 4 }}>
                      现货 {product.stock} 件
                    </div>
                  </div>
                  <div>
                    <Text strong>商品评分</Text>
                    <div style={{ marginTop: 4 }}>
                      <Rate disabled defaultValue={product.rating} />
                    </div>
                  </div>
                </Space>
              </div>

              {/* 购买按钮 */}
              <Button 
                type="primary" 
                size="large"
                block
                style={{ 
                  height: '50px',
                  fontSize: '18px',
                  borderRadius: '12px'
                }}
                onClick={handleAddToCart}
              >
                加入购物车
              </Button>

              {/* 商品描述 */}
              <div style={{ marginTop: 24 }}>
                <Paragraph style={{ 
                  whiteSpace: 'pre-line',
                  color: '#666',
                  fontSize: '14px'
                }}>
                  {product.description}
                </Paragraph>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* 相关推荐部分保持不变 */}
      <div style={{ marginTop: 40 }}>
        <Title level={3} style={{ marginBottom: 24 }}>相关推荐</Title>
        <Row gutter={[16, 16]}>
          {relatedProducts.map(item => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <Card
                hoverable
                style={{ height: '100%' }}
                cover={
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                      alt={item.name}
                      src={item.image}
                      style={{ maxHeight: '100%', objectFit: 'cover' }}
                    />
                  </div>
                }
                onClick={() => navigate(`/customer/product/${item.id}`)}
                actions={[
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart();
                    }}
                  >
                    加入购物车
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{item.name}</span>
                      <Tag color="red">¥{item.price}</Tag>
                    </div>
                  }
                  description={
                    <>
                      <Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
                      <div>
                        <Tag color="orange">库存: {item.stock}</Tag>
                        <Tag color="green">评分: {item.rating}</Tag>
                      </div>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default ProductDetail;