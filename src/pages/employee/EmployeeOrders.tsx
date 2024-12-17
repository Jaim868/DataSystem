import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, message, Card, DatePicker, Select, Alert, Empty } from 'antd';
import { Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface Order {
  order_no: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  item_count: number;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

interface EmployeeInfo {
  username: string;
  store_name: string;
  store_id: number;
}

const EmployeeOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);
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

      const response = await axios.get(`/api/employee/orders?${params.toString()}`);
      const { success, employee, orders: orderData, error } = response.data;

      if (success) {
        setEmployeeInfo(employee);
        setOrders(orderData);
      } else {
        console.error('获取订单失败:', error);
        message.error(error || '获取订单列表失败');
        setOrders([]);
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      message.error('获取订单列表失败');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderNo: string, newStatus: string) => {
    try {
      await axios.put(`/api/orders/${orderNo}`, { status: newStatus });
      message.success('订单状态更新成功');
      fetchOrders();
    } catch (error) {
      message.error('更新订单状态失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'gold';
      case 'processing':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'processing':
        return '处理中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  const columns = [
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
      title: '订单金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '商品数量',
      dataIndex: 'item_count',
      key: 'item_count',
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Order) => (
        <Space>
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
          {status !== 'completed' && status !== 'cancelled' && (
            <Select
              defaultValue="更改状态"
              style={{ width: 120 }}
              onChange={(value) => handleStatusChange(record.order_no, value)}
              options={[
                { value: 'processing', label: '标记处理中' },
                { value: 'completed', label: '标记完成' },
                { value: 'cancelled', label: '标记取消' },
              ]}
            />
          )}
        </Space>
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
    <div>
      <Title level={2}>订单管理</Title>
      
      {employeeInfo && (
        <Alert
          message={`当前员工: ${employeeInfo.username} | 所属门店: ${employeeInfo.store_name}`}
          type="info"
          style={{ marginBottom: 16 }}
        />
      )}
      
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

      {orders.length === 0 ? (
        <Card>
          <Empty description="暂无订单数据" />
        </Card>
      ) : (
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="order_no"
          loading={loading}
          expandable={{
            expandedRowRender: (record) => (
              <Card title="订单详情">
                <Table
                  dataSource={record.items}
                  columns={[
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
                      title: '单价',
                      dataIndex: 'price',
                      key: 'price',
                      render: (price: number) => `¥${price.toFixed(2)}`,
                    },
                    {
                      title: '小计',
                      key: 'subtotal',
                      render: (_, record: any) => 
                        `¥${(record.price * record.quantity).toFixed(2)}`,
                    },
                  ]}
                  pagination={false}
                  rowKey="product_name"
                />
              </Card>
            ),
          }}
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default EmployeeOrders; 