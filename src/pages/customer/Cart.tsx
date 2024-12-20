import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Card, Space, Modal, message, Empty } from 'antd';
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
      
      if (response.data && Array.isArray(response.data)) {
        setCartItems(response.data);
      } else if (response.data.error) {
        message.error(response.data.error);
        setCartItems([]);
      } else {
        message.error('获取购物车数据格式错误');
        setCartItems([]);
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || '获取购物车数据失败');
      console.error('获取购物车数据失败:', error);
      setCartItems([]);
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
        const response = await axios.delete(`/api/cart/${itemId}`);
        
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
  ];

  const totalAmount = cartItems && cartItems.length > 0 
    ? cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    : 0;

  return (
    <div>
      {loading ? (
        <Card loading={true} />
      ) : cartItems.length === 0 ? (
        <Card>
          <Empty description="购物车是空的" />
        </Card>
      ) : (
        <>
          <Table columns={columns} dataSource={cartItems} rowKey="id" />
          <Card style={{ marginTop: 16 }}>
            <Space>
              <span>总计: ¥{totalAmount.toFixed(2)}</span>
              <Button 
                type="primary" 
                onClick={() => setIsModalOpen(true)}
                disabled={cartItems.length === 0}
              >
                结算
              </Button>
            </Space>
          </Card>
        </>
      )}
      
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
        </div>
      </Modal>
    </div>
  );
};

export default Cart; 