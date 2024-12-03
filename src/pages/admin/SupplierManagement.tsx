import React, { useState, useEffect } from 'react';
import {Table, Button, Space, Modal, Form, Input, message, Popconfirm, Select} from 'antd';
import { ColumnsType } from 'antd/es/table';

interface Supplier {
SupplierID: number;
Name: string;
ContactPerson: string;
Phone: string;
Email: string;
}

const { Option } = Select;

const SupplierManagement = () => {
const [suppliers, setSuppliers] = useState<Supplier[]>([]);
const [isModalVisible, setIsModalVisible] = useState(false);
const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [form] = Form.useForm();

    // 模拟后端数据
    useEffect(() => {
    // 在实际开发中，您应该通过 API 调用获取数据
    setSuppliers([
    { SupplierID: 1, Name: '供应商A', ContactPerson: '张三', Phone: '13800000001', Email: 'supplierA@example.com' },
    { SupplierID: 2, Name: '供应商B', ContactPerson: '李四', Phone: '13800000002', Email: 'supplierB@example.com' },
    ]);
    }, []);

    // 添加供应商
    const handleAdd = (values: Omit<Supplier, 'SupplierID'>) => {
    const newSupplier = {
    ...values,
    SupplierID: suppliers.length + 1, // 假设自动生成 ID
    };
    setSuppliers([...suppliers, newSupplier]);
    message.success('供应商添加成功');
    setIsModalVisible(false);
    form.resetFields();
    };

    // 编辑供应商
    const handleEdit = (values: Supplier) => {
    const updatedSuppliers = suppliers.map(supplier =>
    supplier.SupplierID === editingSupplier?.SupplierID ? { ...values, SupplierID: supplier.SupplierID } : supplier
    );
    setSuppliers(updatedSuppliers);
    message.success('供应商信息更新成功');
    setIsModalVisible(false);
    setEditingSupplier(null);
    form.resetFields();
    };

    // 删除供应商
    const handleDelete = (SupplierID: number) => {
    setSuppliers(suppliers.filter(supplier => supplier.SupplierID !== SupplierID));
    message.success('供应商删除成功');
    };

    // 表格列定义
    const columns: ColumnsType<Supplier> = [
        {
        title: '供应商ID',
        dataIndex: 'SupplierID',
        },
        {
        title: '供应商名称',
        dataIndex: 'Name',
        },
        {
        title: '联系人',
        dataIndex: 'ContactPerson',
        },
        {
        title: '电话',
        dataIndex: 'Phone',
        },
        {
        title: '邮箱',
        dataIndex: 'Email',
        },
        {
        title: '操作',
        key: 'action',
        render: (_, record) => (
        <Space>
            <Button
                type="link"
                onClick={() => {
            setEditingSupplier(record);
            form.setFieldsValue(record);
            setIsModalVisible(true);
            }}
            >
            编辑
            </Button>
            <Popconfirm
                title="确定要删除这个供应商吗？"
                onConfirm={() => handleDelete(record.SupplierID)}
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
                setEditingSupplier(null);
                form.resetFields();
                setIsModalVisible(true);
                }}
                >
                添加供应商
                </Button>
            </div>

            <Table columns={columns} dataSource={suppliers} rowKey="SupplierID" />

            <Modal
                title={editingSupplier ? "编辑供应商" : "添加供应商"}
            visible={isModalVisible}
            onCancel={() => {
            setIsModalVisible(false);
            setEditingSupplier(null);
            form.resetFields();
            }}
            footer={null}
            >
            <Form
                form={form}
                onFinish={editingSupplier ? handleEdit : handleAdd}
                layout="vertical"
                initialValues={editingSupplier || {}}
            >
                <Form.Item
                    name="Name"
                    label="供应商名称"
                    rules={[{ required: true, message: '请输入供应商名称' }]}
                >
                <Input />
                </Form.Item>
                <Form.Item
                    name="ContactPerson"
                    label="联系人"
                    rules={[{ required: true, message: '请输入联系人' }]}
                >
                <Input />
                </Form.Item>
                <Form.Item
                    name="Phone"
                    label="电话"
                    rules={[{ required: true, message: '请输入电话' }]}
                >
                <Input />
                </Form.Item>
                <Form.Item
                    name="Email"
                    label="邮箱"
                    rules={[
                    { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
                >
                <Input />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            {editingSupplier ? '保存' : '添加'}
                        </Button>
                        <Button onClick={() => {
                        setIsModalVisible(false);
                        setEditingSupplier(null);
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
export default SupplierManagement;
