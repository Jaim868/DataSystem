import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Card, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Employee {
  id: number;
  username: string;
  store_id: number;
  store_name: string;
  hire_date: string;
  salary: number;
  position: string;
  created_at: string;
}

interface Store {
  id: number;
  name: string;
}

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEmployees();
    fetchStores();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/employees');
      const { success, employees: employeeData, error } = response.data;

      if (success && Array.isArray(employeeData)) {
        setEmployees(employeeData);
      } else {
        console.error('获取员工失败:', error);
        message.error(error || '获取员工数据失败');
        setEmployees([]);
      }
    } catch (error: any) {
      console.error('获取员工列表失败:', error);
      message.error(error.response?.data?.error || '获取员工列表失败');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await axios.get('/api/admin/stores');
      const { success, stores: storeData, error } = response.data;

      if (success && Array.isArray(storeData)) {
        setStores(storeData);
      } else {
        console.error('获取商店失败:', error);
        message.error(error || '获取商店数据失败');
        setStores([]);
      }
    } catch (error: any) {
      console.error('获取商店列表失败:', error);
      message.error(error.response?.data?.error || '获取商店列表失败');
      setStores([]);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingEmployee) {
        await axios.put(`/api/admin/employees/${editingEmployee.id}`, values);
        message.success('员工信息更新成功');
      } else {
        await axios.post('/api/admin/employees', values);
        message.success('员工添加成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchEmployees();
    } catch (error: any) {
      console.error('操作失败:', error);
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/api/admin/employees/${id}`);
      if (response.data.success) {
        message.success('员工删除成功');
        fetchEmployees();
      } else {
        message.error(response.data.error || '删除失败');
      }
    } catch (error: any) {
      console.error('删除失败:', error);
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '所属商店',
      dataIndex: 'store_name',
      key: 'store_name',
    },
    {
      title: '薪资',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary: number) => `¥${salary.toFixed(2)}`,
    },
    {
      title: '入职日期',
      dataIndex: 'hire_date',
      key: 'hire_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
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
      render: (_: any, record: Employee) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingEmployee(record);
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

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="员工管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingEmployee(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            添加员工
          </Button>
        }
      >
        {loading ? (
          <Card loading={true} />
        ) : employees.length === 0 ? (
          <Empty description="暂无员工数据" />
        ) : (
          <Table
            columns={columns}
            dataSource={employees}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Modal
        title={editingEmployee ? '编辑员工' : '添加员工'}
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
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>

          {!editingEmployee && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="position"
            label="职位"
            rules={[{ required: true, message: '请输入职位' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="store_id"
            label="所属商店"
            rules={[{ required: true, message: '请选择所属商店' }]}
          >
            <Select>
              {stores.map(store => (
                <Select.Option key={store.id} value={store.id}>
                  {store.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="salary"
            label="薪资"
            rules={[{ required: true, message: '请输入薪资' }]}
          >
            <Input type="number" prefix="¥" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingEmployee ? '更新' : '添加'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeManagement; 