import { Form, Input, Button, Card, Radio, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 测试账号
const TEST_ACCOUNTS = {
  admin: {
    username: 'admin',
    password: '123456',
    role: 'admin'
  },
  customer: {
    username: 'user',
    password: '123456',
    role: 'customer'
  }
};

const Login = () => {
  const [userType, setUserType] = useState<'customer' | 'admin'>('customer');
  const navigate = useNavigate();

  const onFinish = (values: { username: string; password: string }) => {
    const account = userType === 'admin' ? TEST_ACCOUNTS.admin : TEST_ACCOUNTS.customer;
    
    if (values.username === account.username && values.password === account.password) {
      // 保存登录信息
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('userRole', account.role);
      localStorage.setItem('username', account.username);
      
      message.success('登录成功！');
      
      // 根据角色跳转到不同页面
      if (userType === 'admin') {
        navigate('/admin/employees');
      } else {
        navigate('/customer/home');
      }
    } else {
      message.error('用户名或密码错误！');
    }
  };

  return (
    <div className="login-container">
      <Card title="渔具商店登录" className="login-card">
        <Form onFinish={onFinish}>
          <Form.Item>
            <Radio.Group 
              value={userType} 
              onChange={e => setUserType(e.target.value)}
            >
              <Radio.Button value="customer">用户登录</Radio.Button>
              <Radio.Button value="admin">商家登录</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder={`${userType === 'admin' ? '商家' : '用户'}账号`} 
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: '#999' }}>
            测试账号：
            {userType === 'admin' ? 'admin / 123456' : 'user / 123456'}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 