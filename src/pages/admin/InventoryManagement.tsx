import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, InputNumber } from 'antd';
import { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';

interface Inventory {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  category: string;
  supplier: string;
}

const InventoryManagement = () => {
  const [inventory, setInventory] = useState<Inventory[]>([
    {
      id: 1,
      productName: '碳素鱼竿',
      quantity: 100,
      price: 299,
      category: '鱼竿',
      supplier: '渔具供应商A'
    }
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [form] = Form.useForm();

  const handleAdd = (values: Omit<Inventory, 'id'>) => {
    const newItem = {
      ...values,
      id: inventory.length + 1,
    };
    setInventory([...inventory, newItem]);
    message.success('添加成功');
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEdit = (values: Inventory) => {
    const newInventory = inventory.map(item => 
      item.id === editingItem?.id ? { ...values, id: item.id } : item
    );
    setInventory(newInventory);
    message.success('修改成功');
    setIsModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleDelete = (id: number) => {
    setInventory(inventory.filter(item => item.id !== id));
    message.success('删除成功');
  };

  const columns: ColumnsType<Inventory> = [
    {
      title: '商品ID',
      dataIndex: 'id',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
    },
    {
      title: '库存数量',
      dataIndex: 'quantity',
    },
    {
      title: '单价',
      dataIndex: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '分类',
      dataIndex: 'category',
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => {
              setEditingItem(record);
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
            setEditingItem(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          添加商品
        </Button>
      </div>
      
      <Table columns={columns} dataSource={inventory} rowKey="id" />
      
      <Modal
        title={editingItem ? "编辑商品" : "添加商品"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingItem(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={editingItem ? handleEdit : handleAdd}
          layout="vertical"
        >
          <Form.Item
            name="productName"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="库存数量"
            rules={[{ required: true, message: '请输入库存数量' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="price"
            label="单价"
            rules={[{ required: true, message: '请输入单价' }]}
          >
            <InputNumber min={0} precision={2} prefix="¥" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请输入分类' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="supplier"
            label="供应商"
            rules={[{ required: true, message: '请输入供应商' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? '保存' : '添加'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingItem(null);
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

export default InventoryManagement; 