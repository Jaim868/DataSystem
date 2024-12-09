import React, { useState, useEffect } from 'react';
import { Table, InputNumber, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
  sales: number;
  updated_at: string;
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/products');
      setInventory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('获取库存列表失败:', error);
      setInventory([]); // 出错时设置空数组
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (id: number, stock: number) => {
    try {
      await axios.post(`/api/admin/products/${id}/stock`, { stock });
      message.success('库存更新成功');
      fetchInventory();
    } catch (error) {
      message.error('库存更新失败');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const columns: ColumnsType<Product> = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number, record) => (
        <>
          <InputNumber
            min={0}
            value={stock}
            onChange={(value) => handleUpdateStock(record.id, value || 0)}
          />
          {stock < 10 && <Tag color="red" style={{ marginLeft: 8 }}>库存不足</Tag>}
        </>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Table
        columns={columns}
        dataSource={inventory || []} // 添加空数组作为后备
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default InventoryManagement; 