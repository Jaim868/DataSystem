import React from 'react';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, ShoppingCartOutlined, ShopOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import UserInfo from '../components/UserInfo';

const { Header, Content, Sider } = Layout;

const EmployeeLayout: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/employee/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/employee/dashboard">仪表盘</Link>,
    },
    {
      key: '/employee/orders',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/employee/orders">订单管理</Link>,
    },
    {
      key: '/employee/inventory',
      icon: <ShopOutlined />,
      label: <Link to="/employee/inventory">库存管理</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', display: 'flex', justifyContent: 'flex-end' }}>
        <UserInfo />
      </Header>
      <Layout>
        <Sider width={200}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default EmployeeLayout; 