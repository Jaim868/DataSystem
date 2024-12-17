import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography } from 'antd';
import { ShopOutlined, DollarOutlined, InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

interface DashboardData {
  totalProducts: number;
  totalRevenue: number;
  lowStockProducts: number;
  recentOrders: any[];
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
      setData(response.data);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
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
        <Table
          columns={columns}
          dataSource={data.recentOrders}
          rowKey="order_no"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default SupplierDashboard; 