import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Typography,
  message,
  Upload,
  Select
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { getSupplierProducts, addProduct, updateProduct } from '../../api/supplier';
import type { RcFile } from 'antd/es/upload/interface';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  image_url: string;
  retail_price: number;
  supply_price: number;
}

const SupplierProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<RcFile | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await getSupplierProducts();
      setProducts(response.products);
    } catch (error) {
      console.error('获取商品列表失败:', error);
      message.error('获取商品数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        formData.append(key, values[key]);
      });

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        message.success('商品更新成功');
      } else {
        await addProduct(formData);
        message.success('商品添加成功');
      }

      setModalVisible(false);
      form.resetFields();
      setImageFile(null);
      fetchProducts();
    } catch (error) {
      console.error('保存商品失败:', error);
      message.error('保存商品失败');
    }
  };

  const handleEdit = (record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      category: record.category,
      retail_price: record.retail_price,
      supply_price: record.supply_price,
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const columns = [
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
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '零售价格',
      dataIndex: 'retail_price',
      key: 'retail_price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '供应价格',
      dataIndex: 'supply_price',
      key: 'supply_price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Product) => (
        <Space size="small">
          <Button type="primary" onClick={() => handleEdit(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
          <Title level={2}>商品管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加商品
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
        />

        <Modal
          title={editingProduct ? '编辑商品' : '添加商品'}
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setImageFile(null);
          }}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="商品名称"
              rules={[{ required: true, message: '请输入商品名称' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="商品描述"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="category"
              label="商品分类"
              rules={[{ required: true, message: '请选择商品分类' }]}
            >
              <Select>
                <Option value="鱼竿">鱼竿</Option>
                <Option value="渔线">渔线</Option>
                <Option value="鱼钩">鱼钩</Option>
                <Option value="饵料">饵料</Option>
                <Option value="工具">工具</Option>
                <Option value="服饰">服饰</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="retail_price"
              label="零售价格"
              rules={[{ required: true, message: '请输入零售价格' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                prefix="¥"
              />
            </Form.Item>

            <Form.Item
              name="supply_price"
              label="供应价格"
              rules={[{ required: true, message: '请输入供应价格' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                prefix="¥"
              />
            </Form.Item>

            <Form.Item
              label="商品图片"
            >
              <Upload
                accept="image/*"
                maxCount={1}
                beforeUpload={(file) => {
                  setImageFile(file);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>选择图片</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default SupplierProducts; 