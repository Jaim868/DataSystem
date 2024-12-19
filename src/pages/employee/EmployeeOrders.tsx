import React, { useState, useEffect } from 'react';
import { Table, Tag, message, Space, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

interface OrderItem {
  key: string;
  order_no: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  products: string[];
  quantities: number[];
}

const EmployeeOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/employee/orders');
      if (response.data.success) {
        setOrders(response.data.data || []); // 使用空数组作为后备
      } else {
        message.error(response.data.error || '获取订单失败');
      }
    } catch (error) {
      message.error('获取订单列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (status: string, order_no: string) => {
    try {
      const response = await axios.put('/api/employee/orders', {
        order_no,
        status
      });
      
      if (response.data.success) {
        message.success('订单状态更新成功');
        fetchOrders(); // 重新加载订单列表
      } else {
        message.error(response.data.error || '更新失败');
      }
    } catch (error) {
      message.error('更新订单状态失败');
      console.error(error);
    }
  };

  const columns: ColumnsType<OrderItem> = [
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
      render: (_, record) => (
        <>
          {record.products.map((product, index) => (
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
      key: 'status',
      render: (_, record) => (
        <Select
          value={record.status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(value, record.order_no)}
          options={[
            { value: 'pending', label: '待处理' },
            { value: 'completed', label: '已完成' },
          ]}
        />
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
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="order_no"
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default EmployeeOrders; 