import React, { useState } from 'react';
import { Card, Form, Input, Button, Radio, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'customer'>('customer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      message.error('请输入用户名和密码');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/login', {
        username,
        password
      });

      if (response.data.success) {
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userRole', response.data.role);
        
        message.success('登录成功');
        
        if (response.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/customer');
        }
      } else {
        message.error(response.data.message || '登录失败');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data?.message || '登录失败');
      } else {
        message.error('登录失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: `url('/images/background.jpg')`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      overflow: 'hidden'
    }}>
      <Card
        title={
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold',
              margin: '0 0 20px 0',
              color: '#fff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              商城登录系统
            </h2>
            <Radio.Group
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              style={{ marginBottom: '20px' }}
              size="large"
              buttonStyle="solid"
            >
              <Radio.Button value="customer">用户登录</Radio.Button>
              <Radio.Button value="admin">商家登录</Radio.Button>
            </Radio.Group>
          </div>
        }
        styles={{
          header: {
            background: 'transparent',
            border: 'none'
          },
          body: {
            padding: '24px 32px'
          }
        }}
        style={{
          width: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
        bordered={false}
      >
        <Form
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input 
              placeholder={userType === 'admin' ? '请输入商家账号' : '请输入用户账号'}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password 
              placeholder="请输入密码"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ 
                width: '100%',
                height: '45px',
                fontSize: '16px',
                borderRadius: '8px',
                background: '#1890ff',
                boxShadow: '0 4px 12px rgba(24,144,255,0.3)'
              }}
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ 
            textAlign: 'center', 
            color: '#666',
            background: 'rgba(0,0,0,0.03)',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '20px',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '10px',
              color: '#333'
            }}>
              测试账号
            </div>
            {userType === 'admin' ? (
              <p style={{ margin: 0 }}>商家账号：admin<br/>密码：admin</p>
            ) : (
              <p style={{ margin: 0 }}>用户账号：user<br/>密码：user</p>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
