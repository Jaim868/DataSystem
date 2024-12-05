import React, { useState, useEffect } from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  orderNo: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createTime: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);
  }, []);

  const columns: ColumnsType<Order> = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
    },
    {
      title: '商品信息',
      dataIndex: 'items',
      render: (items: OrderItem[]) => (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {items.map((item, index) => (
            <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <img 
                src={`/images/products/${item.image}`}
                alt={item.name}
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  objectFit: 'cover',
                  marginRight: '8px',
                  borderRadius: '4px'
                }}
              />
              <span>
                {item.name} x {item.quantity} (¥{item.price})
              </span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
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
      dataIndex: 'createTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
  ];

  return (
    <div>
      <Table 
        columns={columns} 
        dataSource={orders} 
        rowKey="orderNo"
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '20px' }}>
              <h4>订单详情</h4>
              <p>下单时间：{new Date(record.createTime).toLocaleString()}</p>
              <h4>商品清单</h4>
              <ul>
                {record.items.map((item, index) => (
                  <li key={index}>
                    {item.name} - 数量：{item.quantity} - 单价：¥{item.price}
                  </li>
                ))}
              </ul>
              <p>总金额：¥{record.totalAmount.toFixed(2)}</p>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default Orders; 