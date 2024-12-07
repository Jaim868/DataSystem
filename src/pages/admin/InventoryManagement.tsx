import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface InventoryItem {
  id: number;
  name: string;
  stock: number;
  price: number;
  category: string;
  sales: number;
  created_at: string;
  updated_at: string;
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (!response.ok) throw new Error('获取库存失败');
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      message.error('获取库存数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (id: number, stock: number) => {
    try {
      const response = await fetch('/api/inventory/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, stock })
      });

      if (!response.ok) throw new Error('更新库存失败');

      setInventory(items =>
        items.map(item =>
          item.id === id ? { ...item, stock } : item
        )
      );
      message.success('库存更新成功');
    } catch (error) {
      message.error('更新库存失败');
      console.error(error);
    }
  };

  const handleAddProduct = async (values: any) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) throw new Error('添加商品失败');
      
      const data = await response.json();
      setInventory([...inventory, { ...values, id: data.id }]);
      message.success('添加商品成功');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('添加商品失败');
      console.error(error);
    }
  };

  const columns: ColumnsType<InventoryItem> = [
    {
      title: '商品名称',
      dataIndex: 'name',
    },
    {
      title: '类别',
      dataIndex: 'category',
    },
    {
      title: '库存',
      dataIndex: 'stock',
      render: (stock: number, record) => (
        <InputNumber
          min={0}
          value={stock}
          onChange={(value) => handleUpdateStock(record.id, value || 0)}
        />
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '销量',
      dataIndex: 'sales',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      render: (time: string) => new Date(time).toLocaleString(),
    }
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
      
      <Table 
        columns={columns} 
        dataSource={inventory} 
        rowKey="id"
        loading={loading}
      />
      
      <Modal
        title="添加商品"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddProduct}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="类别"
            rules={[{ required: true, message: '请输入商品类别' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              prefix="¥"
            />
          </Form.Item>
          <Form.Item
            name="stock"
            label="初始库存"
            rules={[{ required: true, message: '请输入初始库存' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
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