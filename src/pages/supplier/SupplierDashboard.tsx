import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Tag, Empty, message } from 'antd';
import { ShopOutlined, DollarOutlined, InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

interface DashboardData {
  totalProducts: number;
  totalRevenue: number;
  lowStockProducts: number;
  recentOrders: Array<{
    order_no: string;
    product_name: string;
    quantity: number;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

const SupplierDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    totalProducts: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    recentOrders: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/supplier/dashboard');
      if (response.data.success && response.data.data) {
        setData({
          totalProducts: response.data.data.totalProducts || 0,
          totalRevenue: response.data.data.totalRevenue || 0,
          lowStockProducts: response.data.data.lowStockProducts || 0,
          recentOrders: Array.isArray(response.data.data.recentOrders) 
            ? response.data.data.recentOrders 
            : []
        });
      } else {
        message.error(response.data.error || '获取数据失败');
        setData({
          totalProducts: 0,
          totalRevenue: 0,
          lowStockProducts: 0,
          recentOrders: []
        });
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取仪表盘数据失败');
      setData({
        totalProducts: 0,
        totalRevenue: 0,
        lowStockProducts: 0,
        recentOrders: []
      });
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
      title: '商品名称',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '总金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString()
    }
  ];

  return (
    <div>
      <Title level={2}>供应商主页</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic
              title="总商品数"
              value={data.totalProducts}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic
              title="总收入"
              value={data.totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic
              title="库存不足商品"
              value={data.lowStockProducts}
              prefix={<InboxOutlined />}
              valueStyle={{ color: data.lowStockProducts > 0 ? '#cf1322' : '#3f8600' }}
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

export default SupplierDashboard; 