import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  order_no: string;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  create_time: string;
  items: OrderItem[];
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('获取订单列表失败');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      message.error('获取订单列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderNo: string, status: Order['status']) => {
    try {
      const response = await fetch('/api/orders/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo, status })
      });

      if (!response.ok) throw new Error('更新订单状态失败');

      setOrders(orders.map(order =>
        order.order_no === orderNo ? { ...order, status } : order
      ));
      message.success('订单状态更新成功');
    } catch (error) {
      message.error('更新订单状态失败');
      console.error(error);
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: '订单编号',
      dataIndex: 'order_no',
    },
    {
      title: '客户名称',
      dataIndex: 'customer_name',
    },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      render: (status: Order['status']) => {
        const statusMap = {
          pending: { color: 'gold', text: '待处理' },
          processing: { color: 'blue', text: '处理中' },
          completed: { color: 'green', text: '已完成' },
          cancelled: { color: 'red', text: '已取消' }
        };
        return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
      },
    },
    {
      title: '下单时间',
      dataIndex: 'create_time',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Button 
              type="link" 
              onClick={() => handleStatusChange(record.order_no, 'processing')}
            >
              开始处理
            </Button>
          )}
          {record.status === 'processing' && (
            <Button 
              type="link" 
              onClick={() => handleStatusChange(record.order_no, 'completed')}
            >
              完成订单
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'processing') && (
            <Popconfirm
              title="确定要取消订单吗？"
              onConfirm={() => handleStatusChange(record.order_no, 'cancelled')}
            >
              <Button type="link" danger>取消订单</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    }
  ];

  const expandedRowRender = (record: Order) => {
    const columns: ColumnsType<OrderItem> = [
      { title: '商品名称', dataIndex: 'name' },
      { 
        title: '单价', 
        dataIndex: 'price',
        render: (price: number) => `¥${price.toFixed(2)}`,
      },
      { title: '数量', dataIndex: 'quantity' },
      { 
        title: '小计',
        render: (_, record) => `¥${(record.price * record.quantity).toFixed(2)}`,
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={record.items}
        pagination={false}
        rowKey="id"
      />
    );
  };

  return (
    <Table
      columns={columns}
      dataSource={orders}
      expandable={{ expandedRowRender }}
      rowKey="order_no"
      loading={loading}
    />
  );
};

export default OrderManagement; 