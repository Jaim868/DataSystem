import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, message, Spin, InputNumber, Tabs, Divider } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
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
        setProduct(response.data);
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
    if (!product) return;
    
    setAddingToCart(true);
    try {
      await axios.post('/api/cart', {
        product_id: product.id,
        quantity: quantity
      });
      message.success('已添加到购物车');
    } catch (error) {
      console.error('添加到购物车失败:', error);
      message.error('添加到购物车失败');
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

  return (
    <div className="product-detail" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 商品标题区域 */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Title level={1} className="product-detail-title" style={{ fontSize: '48px', marginBottom: '16px' }}>
          {product.name}
        </Title>
        <Text className="product-detail-description" type="secondary" style={{ fontSize: '18px' }}>
          {product.description}
        </Text>
      </div>

      <Row gutter={[48, 48]}>
        {/* 左侧商品图片 */}
        <Col xs={24} md={14}>
          <div style={{ position: 'sticky', top: '24px' }}>
            <img 
              className="product-detail-image"
              src={product.image_url} 
              alt={product.name} 
              style={{ 
                width: '100%', 
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} 
            />
          </div>
        </Col>

        {/* 右侧商品信息 */}
        <Col xs={24} md={10}>
          <div style={{ position: 'sticky', top: '24px' }}>
            <Card className="product-detail-card" bordered={false} style={{ background: '#f7f7f7', borderRadius: '12px' }}>
              <Title level={3}>选择配置</Title>
              
              <Divider />

              <div style={{ marginBottom: '24px' }}>
                <Text strong style={{ fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                  价格
                </Text>
                <Text className="product-detail-price" type="danger" style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  ¥{Number(product.price).toFixed(2)}
                </Text>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <Text strong style={{ fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                  数量
                </Text>
                <InputNumber
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(value) => setQuantity(value || 1)}
                  style={{ width: '120px' }}
                />
                <Text type="secondary" style={{ marginLeft: '12px' }}>
                  库存: {product.stock}
                </Text>
              </div>

              {product.features && product.features.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <Text strong style={{ fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                    产品特点
                  </Text>
                  <ul className="product-detail-features" style={{ paddingLeft: '20px' }}>
                    {product.features.map((feature, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>
                        <Text>{feature}</Text>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                className="buy-button"
                type="primary" 
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                loading={addingToCart}
                disabled={product.stock <= 0}
                block
                style={{ height: '50px', fontSize: '18px' }}
              >
                {product.stock <= 0 ? '暂时缺货' : '加入购物车'}
              </Button>

              {/* 销量和评分信息 */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">销量: {product.sales}</Text>
                <Text type="secondary">评分: {product.rating}分</Text>
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* 商品详细信息标签页 */}
      <div style={{ marginTop: '48px' }}>
        <Tabs className="product-detail-tabs" defaultActiveKey="1" onChange={setSelectedTab}>
          <TabPane tab="商品详情" key="1">
            <div style={{ padding: '24px' }}>
              <Paragraph>
                <Title level={4}>产品描述</Title>
                {product.description}
              </Paragraph>
              
              <Divider />
              
              <Title level={4}>规格参数</Title>
              <ul>
                <li>类别：{product.category}</li>
                {product.features?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </TabPane>
          <TabPane tab="评价" key="2">
            <div style={{ padding: '24px' }}>
              <Text>暂无评价</Text>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetail;