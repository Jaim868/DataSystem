import React, { useState, useEffect } from 'react';
import { Table, Tag, InputNumber, Button, message, Space } from 'antd';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  stock: number;
  min_stock: number;
  max_stock: number;
  status: 'normal' | 'low' | 'out';
}

const InventoryManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/employee/inventory');
      setProducts(response.data);
    } catch (error) {
      message.error('获取库存数据失败');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: number, stock: number) => {
    try {
      await axios.put(`/api/employee/inventory/${id}`, { stock });
      message.success('库存更新成功');
      fetchInventory();
    } catch (error) {
      message.error('库存更新失败');
    }
  };

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '当前库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number, record: Product) => (
        <InputNumber
          min={0}
          value={stock}
          onChange={(value) => updateStock(record.id, value || 0)}
        />
      ),
    },
    {
      title: '库存状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          normal: { color: 'green', text: '正常' },
          low: { color: 'orange', text: '偏低' },
          out: { color: 'red', text: '缺货' },
        };
        const { color, text } = statusMap[status as keyof typeof statusMap];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '库存范围',
      key: 'stock_range',
      render: (_: any, record: Product) => (
        <span>{record.min_stock} - {record.max_stock}</span>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default InventoryManagement; 