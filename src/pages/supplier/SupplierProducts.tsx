import React, { useEffect, useState } from 'react';
import { Table, message, Card, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

interface Product {
    id: number;
    name: string;
    price: number | null;
    supply_price: number | null;
    description: string;
    category: string;
    image_url: string;
    stock: number;
    rating: number | null;
}

const SupplierProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/supplier/products');
            const { success, products: productData, error } = response.data;

            if (success && Array.isArray(productData)) {
                const formattedProducts = productData.map((product: any) => ({
                    ...product,
                    price: product.price ? Number(product.price) : null,
                    supply_price: product.supply_price ? Number(product.supply_price) : null,
                    rating: product.rating ? Number(product.rating) : null,
                    stock: Number(product.stock)
                }));
                setProducts(formattedProducts);
            } else {
                console.error('获取商品失败:', error);
                message.error(error || '获取商品数据失败');
                setProducts([]);
            }
        } catch (error: any) {
            console.error('获取商品列表失败:', error);
            message.error(error.response?.data?.error || '获取商品列表失败');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<Product> = [
        {
            title: '商品名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '销售价格',
            dataIndex: 'price',
            key: 'price',
            render: (price: number | null) => {
                if (price === null || isNaN(price)) return '暂无价格';
                return `¥${price.toFixed(2)}`;
            }
        },
        {
            title: '供应价格',
            dataIndex: 'supply_price',
            key: 'supply_price',
            render: (price: number | null) => {
                if (price === null || isNaN(price)) return '暂无价格';
                return `¥${price.toFixed(2)}`;
            }
        },
        {
            title: '库存',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock: number) => stock || 0
        },
        {
            title: '评分',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating: number | null) => {
                if (rating === null || isNaN(rating)) return '暂无评分';
                return rating.toFixed(1);
            }
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => category || '未分类'
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h2>商品管理</h2>
            {loading ? (
                <Card loading={true} />
            ) : products.length === 0 ? (
                <Card>
                    <Empty description="暂无商品数据" />
                </Card>
            ) : (
                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey={(record) => record.id.toString()}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default SupplierProducts; 