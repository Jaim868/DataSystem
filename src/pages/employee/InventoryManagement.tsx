import React, { useState, useEffect } from 'react';
import { Table, InputNumber, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

interface InventoryItem {
  key: number;
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/employee/inventory');
      if (response.data.success) {
        setInventory(response.data.data || []);
      } else {
        message.error(response.data.error || '获取库存数据失败');
      }
    } catch (error) {
      console.error('获取库存数据失败:', error);
      message.error('获取库存数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = async (id: number, stock: number) => {
    try {
      const response = await axios.put(`/api/employee/inventory/${id}`, { stock });
      if (response.data.success) {
        message.success('库存更新成功');
        fetchInventory();
      } else {
        message.error(response.data.error || '更新失败');
      }
    } catch (error) {
      console.error('更新库存失败:', error);
      message.error('更新库存失败');
    }
  };

  const columns: ColumnsType<InventoryItem> = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.stock}
          onChange={(value) => handleStockChange(record.id, value || 0)}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={inventory}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default InventoryManagement; 