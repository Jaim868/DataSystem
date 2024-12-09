import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Upload, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url: string;
  stock: number;
  sales: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

interface ApiError {
  message?: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  // 获取商品列表
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/products');
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('获取商品列表失败');
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      
      // 添加基本字段
      Object.keys(values).forEach(key => {
        // 跳过图片字段和空值
        if (key !== 'image' && values[key] !== undefined && values[key] !== null) {
          formData.append(key, typeof values[key] === 'number' ? values[key].toString() : values[key]);
        }
      });

      // 处理图片上传
      if (values.image?.[0]?.originFileObj) {
        formData.append('image', values.image[0].originFileObj);
      }

      if (editingProduct) {
        // 编辑商品 - 使用POST方法，添加_method字段来模拟PUT
        formData.append('_method', 'PUT');
        const response = await axios.post(`/api/admin/products/${editingProduct.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.success) {
          message.success('商品更新成功');
          setModalVisible(false);
          form.resetFields();
          fetchProducts();
        } else {
          throw new Error(response.data.message || '更新失败');
        }
      } else {
        // 添加商品
        const response = await axios.post('/api/admin/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.success) {
          message.success('商品添加成功');
          setModalVisible(false);
          form.resetFields();
          fetchProducts();
        } else {
          throw new Error(response.data.message || '添加失败');
        }
      }
    } catch (error: unknown) {
      console.error('操作失败:', error);
      const err = error as ApiError;
      message.error(err.message || '操作失败');
    }
  };

  // 处理删除商品
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/admin/products/${id}`);
      message.success('商品删除成功');
      fetchProducts();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '商品图片',
      dataIndex: 'image_url',
      key: 'image_url',
      render: (url: string) => (
        <img src={url} alt="商品图片" style={{ width: 50, height: 50, objectFit: 'cover' }} />
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
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
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => {
              setEditingProduct(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个商品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
  };

  return (
    <div style={{ padding: '24px' }}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingProduct(null);
          form.resetFields();
          setModalVisible(true);
        }}
        style={{ marginBottom: '16px' }}
      >
        添加商品
      </Button>

      <Table
        columns={columns}
        dataSource={products || []}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingProduct ? '编辑商品' : '添加商品'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={editingProduct || {}}
        >
          <Form.Item
            name="name"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
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
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label="库存"
            rules={[{ required: true, message: '请输入库存' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请输入分类' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="商品描述"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="image"
            label="商品图片"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>选择图片</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingProduct ? '更新' : '添加'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement; 