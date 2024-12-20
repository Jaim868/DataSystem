import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, ShoppingCartOutlined, OrderedListOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/customer/home',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: '/customer/cart',
      icon: <ShoppingCartOutlined />,
      label: '购物车'
    },
    {
      key: '/customer/orders',
      icon: <OrderedListOutlined />,
      label: '我的订单'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: 0 }}>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            if (key === 'logout') {
              handleLogout();
            } else {
              navigate(key);
            }
          }}
          style={{ justifyContent: 'flex-end' }}
        />
      </Header>
      <Content style={{ padding: '24px', background: '#fff' }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default CustomerLayout; 