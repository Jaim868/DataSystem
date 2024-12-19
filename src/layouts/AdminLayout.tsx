import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import {
  TeamOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  ShopOutlined,
  DashboardOutlined,
  LogoutOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import EmployeeManagement from '../pages/admin/EmployeeManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import ProductManagement from '../pages/admin/ProductManagement';
import StoreManagement from '../pages/admin/StoreManagement';
import Dashboard from '../pages/admin/Dashboard';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '18px' }}>渔具商店管理系统</div>
        <Button type="link" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: 'white' }}>
          退出登录
        </Button>
      </Header>
      <Layout>
        <Sider width={200}>
          <Menu mode="inline" theme="dark" defaultSelectedKeys={['dashboard']}>
            <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
              <Link to="/admin/dashboard">仪表盘</Link>
            </Menu.Item>
            <Menu.Item key="stores" icon={<ShoppingOutlined />}>
              <Link to="/admin/stores">商店管理</Link>
            </Menu.Item>
            <Menu.Item key="employees" icon={<TeamOutlined />}>
              <Link to="/admin/employees">员工管理</Link>
            </Menu.Item>
            <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
              <Link to="/admin/orders">订单管理</Link>
            </Menu.Item>
            <Menu.Item key="products" icon={<ShopOutlined />}>
              <Link to="/admin/products">商品管理</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Content style={{ padding: '24px', minHeight: 280 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stores" element={<StoreManagement />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/products" element={<ProductManagement />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 