import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  product_id: number;
}

interface Order {
  order_no: string;
  total_amount: number;
  status: 'pending' | 'shipped';
  created_at: string;
  items: OrderItem[];
}

interface ApiOrder extends Omit<Order, 'items'> {
  items: OrderItem[] | string;  // API 返回的 items 可能是字符串
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        message.error('请先登录');
        navigate('/login');
        return;
      }

      const response = await axios.get<ApiOrder[]>(`/api/orders?userId=${userId}`);
      console.log('Orders response:', response.data);
      
      if (Array.isArray(response.data)) {
        const validOrders = response.data.map(order => ({
          ...order,
          items: Array.isArray(order.items) 
            ? order.items.filter((item: OrderItem | null): item is OrderItem => 
                item !== null && typeof item === 'object' && 'name' in item
              )
            : []
        }));
        setOrders(validOrders);
      } else {
        console.error('Invalid orders data:', response.data);
        message.error('获取订单数据格式错误');
      }
    } catch (error) {
      console.error('Get orders error:', error);
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data?.message || '获取订单列表失败');
      } else {
        message.error('获取订单列表失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: '订单编号',
      dataIndex: 'order_no',
      key: 'order_no',
    },
    {
      title: '商品信息',
      dataIndex: 'items',
      key: 'items',
      render: (items: OrderItem[]) => (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items?.map((item, index) => item && (
            <li key={index}>
              {item.name} x {item.quantity} (¥{Number(item.price).toFixed(2)})
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `¥${Number(amount).toFixed(2)}`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          pending: { text: '待发货', color: 'gold' },
          shipped: { text: '已发货', color: 'green' }
        };
        const { text, color } = statusMap[status as keyof typeof statusMap] || { text: '未知', color: 'default' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleString(),
    },
  ];

  return (
    <Card title="我的订单" style={{ margin: '24px' }}>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="order_no"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default Orders; 