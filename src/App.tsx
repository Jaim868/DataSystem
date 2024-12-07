import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Login from './pages/Login';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* 用户路由 */}
      <Route
        path="/customer/*"
        element={
          <PrivateRoute role="customer">
            <CustomerLayout />
          </PrivateRoute>
        }
      />
      
      {/* 商家路由 */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute role="admin">
            <AdminLayout />
          </PrivateRoute>
        }
      />
      
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App; 