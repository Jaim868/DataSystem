import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm, Select, Tag } from 'antd';
import { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  status: 'active' | 'inactive';
  imageUrl?: string;
}

const { Option } = Select;

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: '碳素鱼竿',
      price: 299,
      description: '高品质碳素材料，轻便耐用',
      category: '鱼竿',
      status: 'active'
    }
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const handleAdd = (values: Omit<Product, 'id'>) => {
    const newProduct = {
      ...values,
      id: products.length + 1,
    };
    setProducts([...products, newProduct]);
    message.success('添加成功');
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEdit = (values: Product) => {
    const newProducts = products.map(product => 
      product.id === editingProduct?.id ? { ...values, id: product.id } : product
    );
    setProducts(newProducts);
    message.success('修改成功');
    setIsModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleDelete = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
    message.success('删除成功');
  };

  const columns: ColumnsType<Product> = [
    {
      title: '商品ID',
      dataIndex: 'id',
    },
    {
      title: '商品名称',
      dataIndex: 'name',
    },
    {
      title: '价格',
      dataIndex: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '分类',
      dataIndex: 'category',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '在售' : '下架'}
        </Tag>
      ),
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
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>删除</Button>
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
      
      <Table columns={columns} dataSource={products} rowKey="id" />
      
      <Modal
        title={editingProduct ? "编辑商品" : "添加商品"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={editingProduct ? handleEdit : handleAdd}
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
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber min={0} precision={2} prefix="¥" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select>
              <Option value="鱼竿">鱼竿</Option>
              <Option value="鱼线">鱼线</Option>
              <Option value="鱼钩">鱼钩</Option>
              <Option value="其他配件">其他配件</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="商品描述"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="active">在售</Option>
              <Option value="inactive">下架</Option>
            </Select>
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