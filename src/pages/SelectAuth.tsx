// pages/SelectAuth.tsx
import React from 'react';
import { Button, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const SelectAuth: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login'); // 跳转到登录页面
    };

    const handleRegister = () => {
        navigate('/register'); // 跳转到注册页面
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f0f2f5'
        }}>
            <Card style={{ width: 400, textAlign: 'center' }}>
                <Title level={2} style={{ marginBottom: 32 }}>
                    欢迎来到渔具商城
                </Title>
                <Button
                    type="primary"
                    size="large"
                    style={{ width: '100%', marginBottom: 16 }}
                    onClick={handleLogin}
                >
                    登录
                </Button>
                <Button
                    type="default"
                    size="large"
                    style={{ width: '100%' }}
                    onClick={handleRegister}
                >
                    注册
                </Button>
            </Card>
        </div>
    );
};

export default SelectAuth;
