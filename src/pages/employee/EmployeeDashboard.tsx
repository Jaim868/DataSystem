import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Typography, Tag } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

interface DashboardData {
  todayOrders: number;
  todaySales: number;
  pendingOrders: number;
  recentOrders: Array<{
    order_no: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

const EmployeeDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    todayOrders: 0,
    todaySales: 0,
    pendingOrders: 0,
    recentOrders: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/employee/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'processing':
        return 'blue';
      case 'completed':
        return 'green';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <Title level={2}>员工工作台</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic
              title="今日订单数"
              value={data.todayOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic
              title="今日销售额"
              value={data.todaySales}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic
              title="待处理订单"
              value={data.pendingOrders}
              prefix={<UserOutlined />}
              valueStyle={{ color: data.pendingOrders > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="最近订单"
        style={{ marginTop: 24 }}
        loading={loading}
      >
        <List
          dataSource={data.recentOrders}
          renderItem={item => (
            <List.Item
              key={item.order_no}
              extra={
                <Tag color={getStatusColor(item.status)}>
                  {item.status}
                </Tag>
              }
            >
              <List.Item.Meta
                title={`订单号: ${item.order_no}`}
                description={
                  <>
                    <Text>客户: {item.customer_name}</Text>
                    <br />
                    <Text>金额: ¥{item.total_amount.toFixed(2)}</Text>
                    <br />
                    <Text type="secondary">
                      下单时间: {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default EmployeeDashboard; 