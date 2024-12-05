import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Space, message, Card, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCheckout = () => {
    setIsModalOpen(true);
  };

  const handleConfirmOrder = () => {
    const order = {
      orderNo: `ORDER${Date.now()}`,
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
    
    // 触发自定义事件通知布局组件更新购物车数量
    window.dispatchEvent(new Event('cartUpdated'));

    message.success('下单成功！');
    navigate('/customer/orders');
    setIsModalOpen(false);
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
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            结算
          </Button>
        </Space>
      </Card>
      <Modal
        title="确认订单"
        open={isModalOpen}
        onOk={handleConfirmOrder}
        onCancel={() => setIsModalOpen(false)}
        okText="确认下单"
        cancelText="返回购物车"
      >
        <div>
          <h3>订单信息确认</h3>
          <p>商品总数：{cartItems.length}</p>
          <p>总金额：¥{totalAmount.toFixed(2)}</p>
          {/* 可以添加更多订单信息 */}
        </div>
      </Modal>
    </div>
  );
};

export default Cart; 