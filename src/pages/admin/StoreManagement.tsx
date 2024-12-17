import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Card, Row, Col, Statistic } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ShopOutlined, TeamOutlined, ShoppingOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  employee_count: number;
  product_count: number;
  monthly_sales: number;
}

const StoreManagement: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/stores');
      setStores(response.data);
    } catch (error) {
      message.error('获取商店列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingStore) {
        await axios.put(`/api/admin/stores/${editingStore.id}`, values);
        message.success('商店更新成功');
      } else {
        await axios.post('/api/admin/stores', values);
        message.success('商店添加成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchStores();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/admin/stores/${id}`);
      message.success('商店删除成功');
      fetchStores();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '商店名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '员工数量',
      dataIndex: 'employee_count',
      key: 'employee_count',
    },
    {
      title: '商品数量',
      dataIndex: 'product_count',
      key: 'product_count',
    },
    {
      title: '月销售额',
      dataIndex: 'monthly_sales',
      key: 'monthly_sales',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Store) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingStore(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const stats = {
    totalStores: stores.length,
    totalEmployees: stores.reduce((acc, store) => acc + store.employee_count, 0),
    totalSales: stores.reduce((acc, store) => acc + store.monthly_sales, 0),
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总商店数"
              value={stats.totalStores}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总员工数"
              value={stats.totalEmployees}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总月销售额"
              value={stats.totalSales}
              prefix={<ShoppingOutlined />}
              precision={2}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingStore(null);
          form.resetFields();
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        添加商店
      </Button>

      <Table
        columns={columns}
        dataSource={stores}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingStore ? '编辑商店' : '添加商店'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="商店名称"
            rules={[{ required: true, message: '请输入商店名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingStore ? '更新' : '添加'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StoreManagement; 