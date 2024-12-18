import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Tag, Empty, message } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

interface DashboardData {
  todayOrders: number;
  todaySales: number;
  pendingOrders: number;
  recentOrders: Array<{
    key: string;
    order_no: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
    products: string[];
    quantities: number[];
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
      if (response.data.success) {
        setData(response.data.data);
      } else {
        message.error(response.data.error || '获取数据失败');
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取仪表盘数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'orange',
      processing: 'blue',
      completed: 'green',
      cancelled: 'red'
    };
    return colorMap[status] || 'default';
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'order_no',
      key: 'order_no',
    },
    {
      title: '客户名称',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: '商品信息',
      key: 'products',
      render: (_: any, record: any) => (
        <>
          {record.products.map((product: string, index: number) => (
            <div key={index}>
              {product} × {record.quantities[index]}
            </div>
          ))}
        </>
      ),
    },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

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
        {!loading && (
          Array.isArray(data.recentOrders) && data.recentOrders.length === 0 ? (
            <Empty description="暂无订单数据" />
          ) : (
            <Table
              columns={columns}
              dataSource={data.recentOrders}
              rowKey="order_no"
              pagination={{ pageSize: 5 }}
            />
          )
        )}
      </Card>
    </div>
  );
};

export default EmployeeDashboard; 