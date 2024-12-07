import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Card, Space, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`/api/cart?userId=${userId}`);
      setCartItems(response.data);
    } catch (error) {
      message.error('获取购物车数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.put('/api/cart', {
        userId,
        itemId,
        quantity
      });
      
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      message.error('更新数量失败');
      console.error(error);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.delete(`/api/cart/${itemId}?userId=${userId}`);
      
      setCartItems(items => items.filter(item => item.id !== itemId));
      message.success('商品已删除');
    } catch (error) {
      message.error('删除商品失败');
      console.error(error);
    }
  };

  const handleCheckout = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        message.error('请先登录');
        navigate('/login');
        return;
      }

      const response = await axios.post(`/api/orders?userId=${userId}`, {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount
      });

      if (response.data.success) {
        message.success('订单创建成功');
        setCartItems([]);
        navigate('/customer/orders');
      } else {
        throw new Error('创建订单失败');
      }
    } catch (error) {
      message.error('创建订单失败');
      console.error('Checkout error:', error);
    }
  };

  const columns: ColumnsType<CartItem> = [
    {
      title: '商品名称',
      dataIndex: 'name',
    },
    {
      title: '单价',
      dataIndex: 'price',
      render: (price: string | number) => `¥${Number(price).toFixed(2)}`,
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
      render: (_, record) => `¥${(Number(record.price) * record.quantity).toFixed(2)}`,
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

  const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

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
        onOk={handleCheckout}
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
