import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  hireDate: string;
}

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('获取员工列表失败');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      message.error('获取员工列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (values: any) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) throw new Error('添加员工失败');
      
      const data = await response.json();
      setEmployees([...employees, { ...values, id: data.id }]);
      message.success('添加成功');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('添加员工失败');
      console.error(error);
    }
  };

  const handleEdit = async (values: any) => {
    if (!editingEmployee) return;
    
    try {
      const response = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) throw new Error('更新员工失败');

      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id ? { ...emp, ...values } : emp
      ));
      message.success('更新成功');
      setIsModalVisible(false);
      setEditingEmployee(null);
      form.resetFields();
    } catch (error) {
      message.error('更新员工失败');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('删除员工失败');

      setEmployees(employees.filter(emp => emp.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除员工失败');
      console.error(error);
    }
  };

  const columns: ColumnsType<Employee> = [
    {
      title: '员工ID',
      dataIndex: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '职位',
      dataIndex: 'position',
    },
    {
      title: '电话',
      dataIndex: 'phone',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '入职日期',
      dataIndex: 'hireDate',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => {
              setEditingEmployee(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          onClick={() => {
            setEditingEmployee(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          添加员工
        </Button>
      </div>
      
      <Table columns={columns} dataSource={employees} rowKey="id" />
      
      <Modal
        title={editingEmployee ? "编辑员工" : "添加员工"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingEmployee(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={editingEmployee ? handleEdit : handleAdd}
          layout="vertical"
          initialValues={editingEmployee || {}}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="position"
            label="职位"
            rules={[{ required: true, message: '请输入职位' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
            rules={[{ required: true, message: '请输入电话' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="hireDate"
            label="入职日期"
            rules={[{ required: true, message: '请输入入职日期' }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingEmployee ? '保存' : '添加'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingEmployee(null);
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

export default EmployeeManagement; 