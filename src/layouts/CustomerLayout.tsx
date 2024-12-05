import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Button, Space } from 'antd';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined, HomeOutlined, OrderedListOutlined, LogoutOutlined } from '@ant-design/icons';
import Home from '../pages/customer/Home';
import Cart from '../pages/customer/Cart';
import Orders from '../pages/customer/Orders';
import ProductDetail from '../pages/customer/ProductDetail';

const { Header, Content } = Layout;

const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [selectedKey, setSelectedKey] = useState(location.pathname);

  // 监听购物车变化
  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cartItems.length);
    };

    // 初始化时更新一次
    updateCartCount();

    // 监听 storage 变化
    window.addEventListener('storage', updateCartCount);
    // 监听自定义事件
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  useEffect(() => {
    setSelectedKey(location.pathname);
  }, [location.pathname]);

  const items = [
    {
      key: '/customer/home',
      label: '首页',
    },
    {
      key: '/customer/cart',
      label: (
        <Link to="/customer/cart">
          购物车
          {cartCount > 0 && (
            <Badge count={cartCount} offset={[10, -5]} />
          )}
        </Link>
      ),
    },
    {
      key: '/customer/orders',
      label: '我的订单',
    },
  ];

  const handleLogout = () => {
    // 清除登录状态
    localStorage.removeItem('isLoggedIn');
    // 可选：清除其他需要清除的数据
    localStorage.removeItem('cart');
    // 跳转到登录页
    navigate('/login');
  };

  return (
    <Layout>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={items}
          onClick={({ key }) => navigate(key)}
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
      <Content style={{ padding: '24px', minHeight: 280 }}>
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