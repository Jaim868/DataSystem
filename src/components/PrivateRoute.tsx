import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: ReactNode;
  role: 'admin' | 'customer';
}

const PrivateRoute = ({ children, role }: PrivateRouteProps) => {
  // 这里应该检查用户是否已登录以及角色是否匹配
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute; 