// pages/Register.tsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

interface RegisterForm {
    username: string;
    password: string;
    confirmPassword: string;
}

const Register: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values: RegisterForm) => {
        setLoading(true);
        if (values.password !== values.confirmPassword) {
            message.error('密码和确认密码不一致');
            setLoading(false);
            return;
        }

        try {
            console.log('Attempting registration with:', { ...values, password: '***' });

            const response = await axios.post('/api/register', values, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Raw response:', response);
            console.log('Response data:', response.data);

            if (typeof response.data === 'string') {
                try {
                    response.data = JSON.parse(response.data);
                } catch (e) {
                    console.error('Failed to parse response as JSON:', e);
                    message.error('服务器响应格式错误');
                    return;
                }
            }

            const { success, message: errorMessage } = response.data;

            if (success) {
                message.success('注册成功，跳转到登录界面');
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else {
                console.error('Registration failed:', errorMessage);
                message.error(errorMessage || '注册失败');
            }
        } catch (error: any) {
            console.error('Registration error:', error);

            if (error.response) {
                console.error('Error response:', error.response.data);
                message.error(error.response.data.message || '注册失败');
            } else if (error.request) {
                console.error('No response received:', error.request);
                message.error('服务器无响应，请稍后重试');
            } else {
                console.error('Error details:', error.message);
                message.error('注册请求失败，请稍后重试');
            }
        } finally {
            setLoading(false);
        }
    };

    // 点击返回按钮，跳转到选择登录或注册页面
    const handleBack = () => {
        navigate('/');
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
                    渔具商城注册
                </Title>
                <Form
                    name="register"
                    onFinish={handleSubmit}
                >
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

                    <Form.Item
                        name="confirmPassword"
                        rules={[{ required: true, message: '请确认密码' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="确认密码"
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
                            注册
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="default"
                            onClick={handleBack}
                            block
                            size="large"
                        >
                            返回
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Register;
