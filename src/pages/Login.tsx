import React, { useState } from 'react';
import { Form, Input, Button, Card, Radio, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'customer' | 'admin'>('customer');

  const onFinish = (values: LoginForm) => {
    if (userType === 'admin' && values.username === 'admin' && values.password === 'admin') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userType', 'admin');
      navigate('/admin');
      message.success('管理员登录成功！');
    } else if (userType === 'customer' && values.username === 'user' && values.password === 'user') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userType', 'customer');
      navigate('/customer/home');
      message.success('用户登录成功！');
    } else {
      message.error('用户名或密码错误！');
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
        style={{
          width: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
        headStyle={{
          background: 'transparent',
          border: 'none'
        }}
        bodyStyle={{
          padding: '24px 32px'
        }}
        bordered={false}
      >
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder={userType === 'admin' ? '请输入商家账号' : '请输入用户账号'}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入密码"
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
