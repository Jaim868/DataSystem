import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Button, Space } from 'antd';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined, HomeOutlined, OrderedListOutlined, LogoutOutlined } from '@ant-design/icons';
import Home from '../pages/customer/Home';
import Cart from '../pages/customer/Cart';
import Orders from '../pages/customer/Orders';
import ProductDetail from '../pages/customer/ProductDetail';
import axios from 'axios';

const { Header, Content } = Layout;

const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [selectedKey, setSelectedKey] = useState(location.pathname);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`/api/cart/count?userId=${userId}`);
        setCartCount(response.data.count);
      } catch (error) {
        console.error('获取购物车数量失败:', error);
      }
    };

    fetchCartCount();
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, [navigate]);

  useEffect(() => {
    setSelectedKey(location.pathname);
  }, [location.pathname]);

  const items = [
    {
      key: '/customer/home',
      label: (
        <Link to="/customer/home">
          首页
        </Link>
      ),
    },
    {
      key: '/customer/cart',
      label: (
        <Link to="/customer/cart">
          购物车
        </Link>
      ),
    },
    {
      key: '/customer/orders',
      label: (
        <Link to="/customer/orders">
          我的订单
        </Link>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <Layout>
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'fixed',  // 固定头部
        width: '100%',
        top: 0,
        zIndex: 1000
      }}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={items}
          style={{ flex: 1 }}
        />
        <Button 
          type="link" 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          style={{ color: '#fff' }}
        >
          退出登录
        </Button>
      </Header>
      <Content style={{ 
        padding: '0', 
        minHeight: '100vh',
        marginTop: 64  // 为固定的 Header 留出空间
      }}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default CustomerLayout; 