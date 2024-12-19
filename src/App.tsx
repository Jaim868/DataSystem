import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SelectAuth from './pages/SelectAuth';
import CustomerLayout from './layouts/CustomerLayout';
import SupplierLayout from './layouts/SupplierLayout';
import EmployeeLayout from './layouts/EmployeeLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthGuard from './components/AuthGuard';

// Customer pages
import Home from './pages/customer/Home';
import Cart from './pages/customer/Cart';
import Orders from './pages/customer/Orders';
import ProductDetail from './pages/customer/ProductDetail';

// Supplier pages
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierProducts from './pages/supplier/SupplierProducts';
import SupplierOrders from './pages/supplier/SupplierOrders';

// Employee pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeOrders from './pages/employee/EmployeeOrders';
import InventoryManagement from './pages/employee/InventoryManagement';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import StoreManagement from './pages/admin/StoreManagement';
import Unauthorized from './pages/Unauthorized';


const App: React.FC = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SelectAuth />} /> {/* 首页路由，选择登录或注册 */}

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* 注册页面路由 */}

          <Route path="/customer" element={
            <AuthGuard allowedRoles={['customer']}>
              <CustomerLayout />
            </AuthGuard>
          }>
            <Route path="home" element={<Home />} />
            <Route path="cart" element={<Cart />} />
            <Route path="orders" element={<Orders />} />
            <Route path="product/:id" element={<ProductDetail />} />
          </Route>

          <Route path="/supplier" element={
            <AuthGuard allowedRoles={['supplier']}>
              <SupplierLayout />
            </AuthGuard>
          }>
            <Route path="dashboard" element={<SupplierDashboard />} />
            <Route path="products" element={<SupplierProducts />} />
            <Route path="orders" element={<SupplierOrders />} />
          </Route>

          <Route path="/employee" element={
            <AuthGuard allowedRoles={['employee']}>
              <EmployeeLayout />
            </AuthGuard>
          }>
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="orders" element={<EmployeeOrders />} />
            <Route path="inventory" element={<InventoryManagement />} />
          </Route>

          <Route path="/admin" element={
            <AuthGuard allowedRoles={['manager']}>
              <AdminLayout />
            </AuthGuard>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="stores" element={<StoreManagement />} />
            <Route path="inventory" element={<InventoryManagement />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;
