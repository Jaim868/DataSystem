import React from 'react';
import { Layout, Menu, Badge } from 'antd';
import { Routes, Route, Link } from 'react-router-dom';
import { ShoppingCartOutlined, HomeOutlined, OrderedListOutlined } from '@ant-design/icons';
import Home from '../pages/customer/Home';
import Cart from '../pages/customer/Cart';
import Orders from '../pages/customer/Orders';
import ProductDetail from '../pages/customer/ProductDetail';

const { Header, Content } = Layout;

const CustomerLayout: React.FC = () => {
  const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

  return (
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src="/images/logo.png" 
          alt="渔具商店" 
          style={{ 
            height: '40px', 
            marginRight: '24px' 
          }} 
        />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['home']}>
          <Menu.Item key="home" icon={<HomeOutlined />}>
            <Link to="/customer/home">首页</Link>
          </Menu.Item>
          <Menu.Item key="cart" icon={<ShoppingCartOutlined />}>
            <Link to="/customer/cart">购物车</Link>
          </Menu.Item>
          <Menu.Item key="orders" icon={<OrderedListOutlined />}>
            <Link to="/customer/orders">我的订单</Link>
          </Menu.Item>
        </Menu>
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