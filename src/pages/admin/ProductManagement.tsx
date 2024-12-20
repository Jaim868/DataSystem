import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Upload, message, Popconfirm, Select } from 'antd';
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
  rating: number;
  store_id: number | null;
  store_name: string | null;
}

interface ApiError {
  message?: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

  // 获取商品列表
  const fetchProducts = async (storeId?: number) => {
    setLoading(true);
    setProducts([]); // 先清空现有数据
    try {
      const url = storeId 
        ? `/api/admin/products?store_id=${storeId}`
        : '/api/admin/products';
      const response = await axios.get(url);
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
        message.error('获取商品列表失败：数据格式错误');
      }
    } catch (error) {
      message.error('获取商品列表失败');
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // 每当商店选择改变时，重置页码并刷新数据
  const handleStoreChange = (value: number | null) => {
    setSelectedStoreId(value);
    setCurrentPage(1);
    fetchProducts(value || undefined);
  };

  // 处理页码变化
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
    fetchProducts(selectedStoreId || undefined);
  };

  useEffect(() => {
    fetchProducts();
    return () => {
      setProducts([]);
    };
  }, []);

  // 处理删除商品
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/admin/products/${id}`);
      message.success('商品删除成功');
      // 删除后刷新当前页数据
      fetchProducts(selectedStoreId || undefined);
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      
      // 添加基本字段
      Object.keys(values).forEach(key => {
        // 跳过图片字段和空值
        if (key !== 'image' && values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key].toString());
        }
      });

      // 处理图片上传
      if (values.image?.[0]?.originFileObj) {
        formData.append('image', values.image[0].originFileObj);
      }

      let response;
      if (editingProduct) {
        // 编辑商品
        formData.append('_method', 'PUT');
        response = await axios.post(`/api/admin/products/${editingProduct.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // 添加商品
        response = await axios.post('/api/admin/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      if (response.data.success) {
        message.success(response.data.message || (editingProduct ? '商品更新成功' : '商品添加成功'));
        setModalVisible(false);
        form.resetFields();
        // 提交后刷新数据
        fetchProducts(selectedStoreId || undefined);
      } else {
        throw new Error(response.data.message || response.data.error || '操作失败');
      }
    } catch (error: any) {
      console.error('操作失败:', error);
      message.error(error.response?.data?.message || error.message || '操作失败');
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
      title: '所属商店',
      dataIndex: 'store_name',
      key: 'store_name',
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
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => rating.toFixed(1),
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
      <Space style={{ marginBottom: '16px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingProduct(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          添加商品
        </Button>
        <Select
          style={{ width: 200 }}
          placeholder="选择商店筛选"
          allowClear
          value={selectedStoreId}
          onChange={handleStoreChange}
        >
          {Array.from(new Set(products.map(p => p.store_id)))
            .filter(id => id !== null)
            .map(storeId => {
              const store = products.find(p => p.store_id === storeId);
              return (
                <Select.Option key={storeId} value={storeId}>
                  {store?.store_name}
                </Select.Option>
              );
            })}
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: products.length,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          showQuickJumper: true,
          onChange: handlePageChange,
        }}
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

          <Form.Item
            name="store_id"
            label="所属商店"
          >
            <Select>
              {Array.from(new Set(products.map(p => p.store_id)))
                .filter(id => id !== null)
                .map(storeId => {
                  const store = products.find(p => p.store_id === storeId);
                  return (
                    <Select.Option key={storeId} value={storeId}>
                      {store?.store_name}
                    </Select.Option>
                  );
                })}
            </Select>
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