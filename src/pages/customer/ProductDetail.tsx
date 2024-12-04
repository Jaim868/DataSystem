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

  // 模拟商品数据
  const mockProduct: Product = {
    id: 1,
    name: '碳素鱼竿',
    price: 299,
    description: '高品质碳素材料，轻便耐用，适合各种钓鱼场景。特点：\n- 超轻碳素材质\n- 伸缩便携设计\n- 防滑手柄\n- 优质导环',
    category: '鱼竿',
    imageUrl: 'https://example.com/fishing-rod.jpg',
    rating: 4.5,
    stock: 50
  };

  // 模拟相关商品数据
  const mockRelatedProducts: Product[] = [
    {
      id: 2,
      name: '专业渔线',
      price: 49,
      description: '高强度尼龙材质渔线',
      category: '鱼线',
      imageUrl: 'https://example.com/fishing-line.jpg',
      rating: 4.3,
      stock: 100
    },
    {
      id: 3,
      name: '精钢鱼钩',
      price: 29,
      description: '锋利耐用的精钢鱼钩',
      category: '鱼钩',
      imageUrl: 'https://example.com/fishing-hook.jpg',
      rating: 4.4,
      stock: 200
    },
    {
      id: 4,
      name: '渔具包',
      price: 159,
      description: '大容量防水渔具包',
      category: '其他配件',
      imageUrl: 'https://example.com/fishing-bag.jpg',
      rating: 4.6,
      stock: 30
    }
  ];

  useEffect(() => {
    // 模拟API请求
    setLoading(true);
    setTimeout(() => {
      setProduct(mockProduct);
      setRelatedProducts(mockRelatedProducts);
      setLoading(false);
    }, 500);
  }, [id]);

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
        <Col xs={24} md={12}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg" />
          </motion.div>
        </Col>
        <Col xs={24} md={12}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Title level={2}>{product.name}</Title>
            <Rate disabled defaultValue={product.rating} />
            <Divider />
            <Title level={3}>￥{product.price}</Title>
            <Text type="secondary">库存: {product.stock}件</Text>
            <Divider />
            <Text>{product.description}</Text>
            <Divider />
            <Button 
              type="primary" 
              icon={<ShoppingCartOutlined />} 
              size="large"
              onClick={handleAddToCart}
            >
              加入购物车
            </Button>
          </motion.div>
        </Col>
      </Row>

      <Divider orientation="left">相关商品</Divider>
      
      <Row gutter={[16, 16]}>
        {relatedProducts.map(item => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
              hoverable
              cover={<img alt={item.name} src={item.imageUrl} />}
              onClick={() => navigate(`/customer/product/${item.id}`)}
            >
              <Card.Meta
                title={item.name}
                description={
                  <>
                    <Text type="danger">￥{item.price}</Text>
                    <br />
                    <Rate disabled defaultValue={item.rating} style={{ fontSize: 12 }} />
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductDetail;