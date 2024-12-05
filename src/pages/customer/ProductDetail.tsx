import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Image, Tag, Divider, message, Rate } from 'antd';
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
      image: 'fishing_rod_carbon.jpg'
    },
    {
      id: 2,
      name: '专业级渔线',
      price: 59,
      description: '日本进口材料，超强韧性，不易断裂。特点：\n- 超强韧性\n- 防缠绕设计\n- 耐磨损\n- 多种规格',
      category: '鱼线',
      rating: 4.3,
      stock: 100,
      image: 'fishing_line_pro.jpg'
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
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <div style={{ 
            background: '#fafafa', 
            padding: '16px',
            borderRadius: '8px',
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Image
              src={`/images/products/${product.image}`}
              alt={product.name}
              style={{ 
                maxWidth: '800px',
                maxHeight: '600px',
                objectFit: 'contain'
              }}
              preview={false}
            />
          </div>
        </Col>
        
        <Col xs={24} md={12}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card style={{ minHeight: '360px' }}>
              <Title level={2}>{product.name}</Title>
              <Title level={3} type="danger">¥{product.price}</Title>
              
              <Divider />
              
              <div style={{ marginBottom: '24px' }}>
                <Text strong>商品评分：</Text>
                <Rate disabled defaultValue={product.rating} />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <Text strong>库存：</Text>
                <Text>{product.stock} 件</Text>
              </div>
              
              <div style={{ whiteSpace: 'pre-line', marginBottom: '24px' }}>
                <Text strong>商品描述：</Text>
                <Paragraph>{product.description}</Paragraph>
              </div>
              
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />} 
                size="large"
                onClick={handleAddToCart}
                block
              >
                加入购物车
              </Button>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Title level={4}>相关推荐</Title>
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