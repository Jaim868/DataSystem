import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Routes, Route, Link } from 'react-router-dom';
import {
  TeamOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  ShopOutlined,
  LogoutOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import EmployeeManagement from '../pages/admin/EmployeeManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import InventoryManagement from '../pages/admin/InventoryManagement';
import ProductManagement from '../pages/admin/ProductManagement';
import SupplierManagement from '../pages/admin/SupplierManagement';  // 导入 SupplierManagement
import Dashboard from '../pages/admin/Dashboard';
import { useNavigate } from 'react-router-dom';

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
            <Menu mode="inline" theme="dark" defaultSelectedKeys={['employees']}>
              <Menu.Item key="employees" icon={<TeamOutlined />}>
                <Link to="/admin/employees">员工管理</Link>
              </Menu.Item>
              <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
                <Link to="/admin/orders">订单管理</Link>
              </Menu.Item>
              <Menu.Item key="inventory" icon={<InboxOutlined />}>
                <Link to="/admin/inventory">库存管理</Link>
              </Menu.Item>
              <Menu.Item key="products" icon={<ShopOutlined />}>
                <Link to="/admin/products">商品管理</Link>
              </Menu.Item>
              <Menu.Item key="suppliers" icon={<ShopOutlined />}> {/* 新增菜单项 */}
                <Link to="/admin/suppliers">供应商管理</Link> {/* 新增链接 */}
              </Menu.Item>
              <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
                <Link to="/admin/dashboard">仪表板</Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Content style={{ padding: '24px', minHeight: 280 }}>
            <Routes>
              <Route path="/employees" element={<EmployeeManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/products" element={<ProductManagement />} />
              <Route path="/suppliers" element={<SupplierManagement />} /> {/* 新增 SupplierManagement 路由 */}
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
  );
};

export default AdminLayout;
