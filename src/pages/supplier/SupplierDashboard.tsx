import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Typography, Statistic } from 'antd';
import { ShopOutlined, DollarOutlined, FileOutlined, CarOutlined } from '@ant-design/icons';
import { getSupplierDashboard } from '../../api/supplier';
import { formatDateTime } from '../../utils/dateUtils';

const { Title } = Typography;

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  shippingOrders: number;
  recentOrders: Array<{
    order_no: string;
    store_name: string;
    store_address: string;
    product_name: string;
    quantity: number;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

const SupplierDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSupplierDashboard();
        setData(response.data);
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'order_no',
      key: 'order_no',
    },
    {
      title: '商店名称',
      dataIndex: 'store_name',
      key: 'store_name',
    },
    {
      title: '商店地址',
      dataIndex: 'store_address',
      key: 'store_address',
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
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: { [key: string]: string } = {
          pending: '待处理',
          processing: '处理中',
          shipping: '配送中',
          completed: '已完成',
          cancelled: '已取消',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDateTime(date),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>供应商仪表盘</Title>
      
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={data?.totalProducts || 0}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={data?.totalOrders || 0}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理订单"
              value={data?.pendingOrders || 0}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="配送中订单"
              value={data?.shippingOrders || 0}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card>
            <Statistic
              title="总收入"
              value={data?.totalRevenue || 0}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="¥"
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: '16px' }}>
        <Title level={3}>最近订单</Title>
        <Table
          columns={columns}
          dataSource={data?.recentOrders || []}
          rowKey="order_no"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default SupplierDashboard; 