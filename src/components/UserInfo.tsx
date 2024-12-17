import React from 'react';
import { Button, Space, Typography } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const UserInfo: React.FC = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Space>
      <Text style={{ color: '#fff' }}>
        <UserOutlined style={{ marginRight: 8 }} />
        {username}
      </Text>
      <Button 
        type="link" 
        icon={<LogoutOutlined />} 
        onClick={handleLogout}
        style={{ color: '#fff' }}
      >
        退出登录
      </Button>
    </Space>
  );
};

export default UserInfo; 