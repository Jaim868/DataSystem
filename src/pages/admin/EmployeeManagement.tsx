import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';

interface Employee {
  id: number;
  name: string;
  position: string;
  phone: string;
  email: string;
  joinDate: string;
}

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: '张三',
      position: '销售经理',
      phone: '13800138000',
      email: 'zhangsan@example.com',
      joinDate: '2023-01-01'
    }
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  const handleAdd = (values: Omit<Employee, 'id'>) => {
    const newEmployee = {
      ...values,
      id: employees.length + 1,
    };
    setEmployees([...employees, newEmployee]);
    message.success('添加成功');
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEdit = (values: Employee) => {
    const newEmployees = employees.map(emp => 
      emp.id === editingEmployee?.id ? { ...values, id: emp.id } : emp
    );
    setEmployees(newEmployees);
    message.success('修改成功');
    setIsModalVisible(false);
    setEditingEmployee(null);
    form.resetFields();
  };

  const handleDelete = (id: number) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    message.success('删除成功');
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
      dataIndex: 'joinDate',
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
            name="joinDate"
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