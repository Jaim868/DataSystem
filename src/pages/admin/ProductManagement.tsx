import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, InputNumber, 
  Upload, Space, Popconfirm, message, Image 
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RcFile } from 'antd/es/upload/interface';

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

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<RcFile | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) throw new Error('获取商品列表失败');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      message.error('获取商品列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    Object.keys(values).forEach(key => {
      formData.append(key, values[key]);
    });
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('操作失败');
      
      const data = await response.json();
      
      if (editingProduct) {
        setProducts(products.map(product =>
          product.id === editingProduct.id 
            ? { ...product, ...values }
            : product
        ));
        message.success('商品更新成功');
      } else {
        setProducts([...products, { ...values, id: data.id }]);
        message.success('商品添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      setImageFile(null);
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('删除商品失败');

      setProducts(products.filter(product => product.id !== id));
      message.success('商品删除成功');
    } catch (error) {
      message.error('删除商品失败');
      console.error(error);
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: '商品图片',
      dataIndex: 'image_url',
      render: (url: string) => (
        <Image
          src={url}
          alt="商品图片"
          width={50}
          height={50}
          style={{ objectFit: 'cover' }}
        />
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
    },
    {
      title: '类别',
      dataIndex: 'category',
    },
    {
      title: '价格',
      dataIndex: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
    },
    {
      title: '销量',
      dataIndex: 'sales',
    },
    {
      title: '评分',
      dataIndex: 'rating',
      render: (rating: number) => rating.toFixed(1),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditingProduct(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此商品吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            setEditingProduct(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          添加商品
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingProduct ? "编辑商品" : "添加商品"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingProduct(null);
          form.resetFields();
          setImageFile(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
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
            name="category"
            label="商品类别"
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
            label="库存"
            rules={[{ required: true, message: '请输入库存' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="商品描述"
            rules={[{ required: true, message: '请输入商品描述' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item label="商品图片">
            <Upload
              beforeUpload={(file) => {
                setImageFile(file);
                return false;
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>选择图片</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingProduct ? '保存' : '添加'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingProduct(null);
                form.resetFields();
                setImageFile(null);
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

export default ProductManagement; 