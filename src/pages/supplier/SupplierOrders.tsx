import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, DatePicker, Select, Space, Typography, message, Empty } from 'antd';
import type { TableProps } from 'antd';
import axios from 'axios';

const { RangePicker } = DatePicker;
const { Title } = Typography;

interface Order {
  order_no: string;
  store_name: string;
  product_name: string;
  quantity: number;
  supply_price: number;
  total_amount: number;
  status: string;
  created_at: string;
}

const SupplierOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [status, setStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [dateRange, status]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('start_date', dateRange[0]);
        params.append('end_date', dateRange[1]);
      }
      if (status !== 'all') {
        params.append('status', status);
      }

      const response = await axios.get(`/api/supplier/orders?${params.toString()}`);
      const { success, orders: orderData, error } = response.data;

      if (success && Array.isArray(orderData)) {
        setOrders(orderData);
      } else {
        console.error('获取订单失败:', error);
        message.error(error || '获取订单数据失败');
        setOrders([]);
      }
    } catch (error: any) {
      console.error('获取订单失败:', error);
      message.error(error.response?.data?.error || '获取订单列表失败');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  };

  const columns: TableProps<Order>['columns'] = [
    {
      title: '订单编号',
      dataIndex: 'order_no',
      key: 'order_no',
    },
    {
      title: '商店',
      dataIndex: 'store_name',
      key: 'store_name',
    },
    {
      title: '商品',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '供应价格',
      dataIndex: 'supply_price',
      key: 'supply_price',
      render: (price: number) => `¥${Number(price).toFixed(2)}`,
    },
    {
      title: '总金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `¥${Number(amount).toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: 'orange',
          processing: 'blue',
          completed: 'green',
          cancelled: 'red',
        };
        return <Tag color={colorMap[status] || 'default'}>{getStatusText(status)}</Tag>;
      },
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
      <Title level={2}>供应订单管理</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space size="large">
          <RangePicker
            onChange={(_, dateStrings) => setDateRange(dateStrings as [string, string])}
          />
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            onChange={setStatus}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'pending', label: '待处理' },
              { value: 'processing', label: '处理中' },
              { value: 'completed', label: '已完成' },
              { value: 'cancelled', label: '已取消' },
            ]}
          />
        </Space>
      </Card>

      {loading ? (
        <Card loading={true} />
      ) : orders.length === 0 ? (
        <Card>
          <Empty description="暂无订单数据" />
        </Card>
      ) : (
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="order_no"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default SupplierOrders; 