import { Table, Button, Space, Modal, Tag, message, Popconfirm } from 'antd';
import { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';

interface Order {
  id: number;
  orderNo: string;
  customerName: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createTime: string;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      orderNo: 'ORD20230001',
      customerName: '李四',
      products: [
        { name: '碳素鱼竿', quantity: 1, price: 299 },
        { name: '渔线', quantity: 2, price: 15 }
      ],
      totalAmount: 329,
      status: 'pending',
      createTime: '2023-05-20 14:30:00'
    }
  ]);

  const handleStatusChange = (orderId: number, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    message.success('订单状态已更新');
  };

  const columns: ColumnsType<Order> = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
    },
    {
      title: '商品信息',
      dataIndex: 'products',
      render: (products: Order['products']) => (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {products.map((p: { name: string; quantity: number; price: number }, index: number) => (
            <li key={index}>
              {p.name} x {p.quantity} (¥{p.price})
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      render: (amount) => `¥${amount.toFixed(2)}`,
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
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Button 
              type="link" 
              onClick={() => handleStatusChange(record.id, 'processing')}
            >
              开始处理
            </Button>
          )}
          {record.status === 'processing' && (
            <Button 
              type="link" 
              onClick={() => handleStatusChange(record.id, 'completed')}
            >
              完成订单
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'processing') && (
            <Popconfirm
              title="确定要取消订单吗？"
              onConfirm={() => handleStatusChange(record.id, 'cancelled')}
            >
              <Button type="link" danger>取消订单</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table 
        columns={columns} 
        dataSource={orders} 
        rowKey="id"
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '20px' }}>
              <h4>订单详情</h4>
              <p>客户：{record.customerName}</p>
              <p>下单时间：{record.createTime}</p>
              <h4>商品清单</h4>
              <ul>
                {record.products.map((p, index) => (
                  <li key={index}>
                    {p.name} - 数量：{p.quantity} - 单价：¥{p.price}
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

export default OrderManagement; 