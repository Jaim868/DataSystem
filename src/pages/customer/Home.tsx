import React, { useState, useEffect } from 'react';
import { Card, Row, Col, message} from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      message.error('获取商品列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {products.map(product => (
          <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={<img alt={product.name} src={product.image_url} />}
              onClick={() => navigate(`/customer/product/${product.id}`)}
            >
              <Card.Meta
                title={product.name}
                description={`¥${product.price}`}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;