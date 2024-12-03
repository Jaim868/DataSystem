import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { ColumnsType } from 'antd/es/table';

// 定义 Customer 类型
interface Customer {
  CustomerID: number;
  Name: string;
  Email: string;
  Phone: string;
  Address: string;
}

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  // 模拟后端数据
  useEffect(() => {
    // 在实际开发中，您应该通过 API 调用获取数据
    setCustomers([
      { CustomerID: 1, Name: '张三', Email: 'zhangsan@example.com', Phone: '12345678901', Address: '北京市海淀区' },
      { CustomerID: 2, Name: '李四', Email: 'lisi@example.com', Phone: '12345678902', Address: '上海市浦东新区' }
    ]);
  }, []);

  // 添加客户
  const handleAdd = (values: Omit<Customer, 'CustomerID'>) => {
    const newCustomer = {
      ...values,
      CustomerID: customers.length + 1,
    };
    setCustomers([...customers, newCustomer]);
    message.success('客户添加成功');
    setIsModalVisible(false);
    form.resetFields();
  };

  // 编辑客户
  const handleEdit = (values: Customer) => {
    const updatedCustomers = customers.map(customer =>
        customer.CustomerID === editingCustomer?.CustomerID ? { ...values } : customer
    );
    setCustomers(updatedCustomers);
    message.success('客户信息更新成功');
    setIsModalVisible(false);
    setEditingCustomer(null);
    form.resetFields();
  };

  // 删除客户
  const handleDelete = (CustomerID: number) => {
    setCustomers(customers.filter(customer => customer.CustomerID !== CustomerID));
    message.success('客户删除成功');
  };

  // 表格列配置
  const columns: ColumnsType<Customer> = [
    {
      title: '客户ID',
      dataIndex: 'CustomerID',
    },
    {
      title: '客户姓名',
      dataIndex: 'Name',
    },
    {
      title: '邮箱',
      dataIndex: 'Email',
    },
    {
      title: '电话',
      dataIndex: 'Phone',
    },
    {
      title: '地址',
      dataIndex: 'Address',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
          <Space>
            <Button
                type="link"
                onClick={() => {
                  setEditingCustomer(record);
                  form.setFieldsValue(record);
                  setIsModalVisible(true);
                }}
            >
              编辑
            </Button>
            <Popconfirm
                title="确认删除此客户吗？"
                onConfirm={() => handleDelete(record.CustomerID)}
            >
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
      ),
    },
  ];

  return (
      <div>
        <Button
            type="primary"
            onClick={() => {
              setEditingCustomer(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
            style={{ marginBottom: 16 }}
        >
          添加客户
        </Button>
        <Table
            columns={columns}
            dataSource={customers}
            rowKey="CustomerID"
        />
        <Modal
            title={editingCustomer ? '编辑客户' : '添加客户'}
            visible={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              setEditingCustomer(null);
              form.resetFields();
            }}
            footer={null}
        >
          <Form
              form={form}
              onFinish={editingCustomer ? handleEdit : handleAdd}
              layout="vertical"
          >
            <Form.Item
                name="Name"
                label="客户姓名"
                rules={[{ required: true, message: '请输入客户姓名' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
                name="Email"
                label="邮箱"
                rules={[{ required: true, message: '请输入客户邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
                name="Phone"
                label="电话"
                rules={[{ required: true, message: '请输入客户电话' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
                name="Address"
                label="地址"
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingCustomer ? '保存' : '添加'}
                </Button>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  setEditingCustomer(null);
                  form.resetFields();
                }}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
};

export default CustomerManagement;
