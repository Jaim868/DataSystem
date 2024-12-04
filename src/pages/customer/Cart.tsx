import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Space, message, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
  }, []);

  const updateQuantity = (id: number, quantity: number) => {
    const newItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const removeItem = (id: number) => {
    const newItems = cartItems.filter(item => item.id !== id);
    setCartItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
    message.success('已从购物车移除');
  };

  const checkout = () => {
    const order = {
      orderNo: `ORD${Date.now()}`,
      items: cartItems,
      totalAmount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'pending',
      createTime: new Date().toISOString()
    };
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // 清空购物车
    localStorage.setItem('cart', '[]');
    setCartItems([]);
    message.success('下单成功！');
  };

  const columns: ColumnsType<CartItem> = [
    {
      title: '商品名称',
      dataIndex: 'name',
    },
    {
      title: '单价',
      dataIndex: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => updateQuantity(record.id, value || 1)}
        />
      ),
    },
    {
      title: '小计',
      render: (_, record) => `¥${(record.price * record.quantity).toFixed(2)}`,
    },
    {
      title: '操作',
      render: (_, record) => (
        <Button type="link" danger onClick={() => removeItem(record.id)}>
          删除
        </Button>
      ),
    },
  ];

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <Table columns={columns} dataSource={cartItems} rowKey="id" />
      <Card style={{ marginTop: 16 }}>
        <Space>
          <span>总计: ¥{totalAmount.toFixed(2)}</span>
          <Button 
            type="primary" 
            onClick={checkout}
            disabled={cartItems.length === 0}
          >
            结算
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Cart; 