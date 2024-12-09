import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  order_no: string;
  total_amount: number;
  status: 'pending' | 'shipped';
  created_at: string;
  items: OrderItem[];
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/orders');
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('获取订单列表失败:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShip = async (orderNo: string) => {
    try {
      await axios.post('/api/admin/orders/status', {
        orderNo,
        status: 'shipped'
      });
      message.success('订单已发货');
      fetchOrders();
    } catch (error) {
      message.error('发货失败');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns: ColumnsType<Order> = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
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
      render: (status: string) => (
        <Tag color={status === 'pending' ? 'gold' : 'green'}>
          {status === 'pending' ? '待发货' : '已发货'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        record.status === 'pending' && (
          <Button 
            type="primary"
            onClick={() => handleShip(record.order_no)}
          >
            发货
          </Button>
        )
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Table
        columns={columns}
        dataSource={orders || []}
        rowKey="order_no"
        loading={loading}
        expandable={{
          expandedRowRender: (record) => (
            <Table
              columns={[
                { title: '商品名称', dataIndex: 'name' },
                { title: '单价', dataIndex: 'price', render: (price: number) => `¥${price.toFixed(2)}` },
                { title: '数量', dataIndex: 'quantity' },
                { 
                  title: '小计', 
                  dataIndex: 'subtotal',
                  render: (_, record: OrderItem) => `¥${(record.price * record.quantity).toFixed(2)}`
                },
              ]}
              dataSource={record.items}
              pagination={false}
              rowKey="id"
            />
          ),
        }}
      />
    </div>
  );
};

export default OrderManagement; 