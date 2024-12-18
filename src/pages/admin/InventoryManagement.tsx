import React, { useState, useEffect } from 'react';
import { Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

interface InventoryItem {
  key: number;
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  total_stock: number;
  store_stocks: Record<string, number>;
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/admin/inventory');
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

  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return { color: 'red', text: '缺货' };
    } else if (stock < 10) {
      return { color: 'orange', text: '低库存' };
    } else {
      return { color: 'green', text: '正常' };
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
      title: '总库存',
      dataIndex: 'total_stock',
      key: 'total_stock',
      render: (stock: number) => {
        const status = getStockStatus(stock);
        return (
          <span>
            {stock} <Tag color={status.color}>{status.text}</Tag>
          </span>
        );
      },
    },
    {
      title: '各店库存',
      key: 'store_stocks',
      render: (_, record) => (
        <div>
          {Object.entries(record.store_stocks).map(([store, stock]) => (
            <div key={store}>
              {store}: {stock}
            </div>
          ))}
        </div>
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