import React, { useEffect, useState } from 'react';
import { Table, Card, Typography, Button, Space, Modal, message } from 'antd';
import { getSupplierOrders, updateOrderStatus } from '../../api/supplier';
import { formatDateTime } from '../../utils/dateUtils';

const { Title } = Typography;

interface Order {
  order_no: string;
  store_name: string;
  store_address: string;
  product_name: string;
  quantity: number;
  supply_price: number;
  total_amount: number;
  status: string;
  created_at: string;
}

const SupplierOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await getSupplierOrders();
      setOrders(response.orders);
    } catch (error) {
      console.error('获取订单失败:', error);
      message.error('获取订单数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderNo: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderNo, newStatus);
      message.success('订单状态更新成功');
      fetchOrders();
    } catch (error) {
      console.error('更新订单状态失败:', error);
      message.error('更新订单状态失败');
    }
  };

  const showStatusConfirm = (orderNo: string, newStatus: string) => {
    const statusText = {
      processing: '开始处理',
      shipping: '开始配送',
      completed: '完成',
      cancelled: '取消'
    }[newStatus];

    Modal.confirm({
      title: '确认更新订单状态',
      content: `确定要${statusText}这个订单吗？`,
      onOk: () => handleStatusUpdate(orderNo, newStatus),
      okText: '确认',
      cancelText: '取消'
    });
  };

  const getStatusActions = (status: string, orderNo: string) => {
    switch (status) {
      case 'pending':
        return [
          <Button key="process" type="primary" onClick={() => showStatusConfirm(orderNo, 'processing')}>
            开始处理
          </Button>,
          <Button key="cancel" danger onClick={() => showStatusConfirm(orderNo, 'cancelled')}>
            取消订单
          </Button>
        ];
      case 'processing':
        return [
          <Button key="ship" type="primary" onClick={() => showStatusConfirm(orderNo, 'shipping')}>
            开始配送
          </Button>
        ];
      case 'shipping':
        return [
          <Button key="complete" type="primary" onClick={() => showStatusConfirm(orderNo, 'completed')}>
            完成订单
          </Button>
        ];
      default:
        return [];
    }
  };

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
      title: '供应价格',
      dataIndex: 'supply_price',
      key: 'supply_price',
      render: (price: number) => `¥${price.toFixed(2)}`,
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
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
        <Space size="small">
          {getStatusActions(record.status, record.order_no)}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>供应订单管理</Title>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="order_no"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default SupplierOrders; 