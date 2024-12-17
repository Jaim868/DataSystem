import React, { useState } from 'react';
import { Form, Input, Button, Card, Radio, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

interface LoginForm {
  username: string;
  password: string;
  role: 'customer' | 'supplier' | 'employee' | 'manager';
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', { ...values, password: '***' });
      
      const response = await axios.post('/api/login', values, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Raw response:', response);
      console.log('Response data:', response.data);
      
      // 检查响应数据的格式
      if (typeof response.data === 'string') {
        try {
          response.data = JSON.parse(response.data);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          message.error('服务器响应格式错误');
          return;
        }
      }
      
      const { success, role, userId, username } = response.data;
      
      if (success) {
        // 存储用户信息
        localStorage.setItem('userId', userId.toString());
        localStorage.setItem('role', role);
        localStorage.setItem('username', username);

        message.success('登录成功');
        console.log('Login successful, redirecting based on role:', role);
        
        // 根据角色跳转到不同的页面
        switch (role) {
          case 'customer':
            navigate('/customer/home');
            break;
          case 'supplier':
            navigate('/supplier/dashboard');
            break;
          case 'employee':
            navigate('/employee/dashboard');
            break;
          case 'manager':
            navigate('/admin/dashboard');
            break;
          default:
            console.error('Unknown role:', role);
            message.error('未知的用户角色');
        }
      } else {
        console.error('Login failed:', response.data.message);
        message.error(response.data.message || '登录失败');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        message.error(error.response.data.message || '登录失败，请检查用户名和密码');
      } else if (error.request) {
        console.error('No response received:', error.request);
        message.error('服务器无响应，请稍后重试');
      } else {
        console.error('Error details:', error.message);
        message.error('登录请求失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          渔具商城登录
        </Title>
        <Form
          name="login"
          onFinish={handleSubmit}
          initialValues={{ role: 'customer' }}
        >
          <Form.Item
            name="role"
            rules={[{ required: true, message: '请选择登录角色' }]}
          >
            <Radio.Group buttonStyle="solid" style={{ width: '100%', marginBottom: 16 }}>
              <Radio.Button value="customer" style={{ width: '25%', textAlign: 'center' }}>
                客户
              </Radio.Button>
              <Radio.Button value="supplier" style={{ width: '25%', textAlign: 'center' }}>
                供应商
              </Radio.Button>
              <Radio.Button value="employee" style={{ width: '25%', textAlign: 'center' }}>
                员工
              </Radio.Button>
              <Radio.Button value="manager" style={{ width: '25%', textAlign: 'center' }}>
                管理员
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
