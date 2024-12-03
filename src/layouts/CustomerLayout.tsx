import React from 'react';
import { Layout, Menu } from 'antd';
import { Routes, Route, Link } from 'react-router-dom';

const { Header, Content } = Layout;

const CustomerLayout: React.FC = () => {
  return (
    <Layout>
      <Header>
        <Menu theme="dark" mode="horizontal">
          <Menu.Item key="home">
            <Link to="/customer/home">首页</Link>
          </Menu.Item>
          <Menu.Item key="cart">
            <Link to="/customer/cart">购物车</Link>
          </Menu.Item>
          <Menu.Item key="orders">
            <Link to="/customer/orders">我的订单</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Routes>
          {/* 添加用户相关路由 */}
        </Routes>
      </Content>
    </Layout>
  );
};

export default CustomerLayout; 