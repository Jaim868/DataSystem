import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Progress, List, Typography } from 'antd';
import { Area } from '@ant-design/plots';
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  ExclamationCircleOutlined,
  RiseOutlined,
  ShopOutlined,
  FireOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

interface DashboardData {
  today: {
    orders: number;
    sales: number;
  };
  total: {
    orders: number;
    sales: number;
  };
  low_stock: number;
  sales_trend: Array<{
    date: string;
    order_count: number;
    daily_sales: number;
  }>;
  top_products: Array<{
    name: string;
    sales: number;
    stock: number;
    price: number;
  }>;
  category_stats: Array<{
    category: string;
    count: number;
    total_sales: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 配置销售趋势图表
  const areaConfig = {
    data: data?.sales_trend?.map(item => ({
      time: item.date.substring(5),
      Sales: Number(item.daily_sales || 0)
    })) || [],
    xField: 'time',
    yField: 'Sales',
    smooth: true,
    animation: true,
    xAxis: {
      tickCount: 7,
      grid: null
    },
    yAxis: {
      label: {
        formatter: (v: string) => `¥${Number(v).toFixed(2)}`
      }
    },
    areaStyle: {
      fill: 'l(270) 0:#ffffff 1:rgb(24, 144, 255, 0.2)'
    },
    line: {
      color: '#1890ff'
    },
    tooltip: {
      title: '销售额',
      position: 'top',
      domStyles: {
        'g2-tooltip': {
          padding: '6px',
          background: '#fff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }
      },
      fields: ['Sales'],
      formatter: (_: any, Sales: number) => {
        return {
          name: '销售额',
          Sales: `¥${Sales.toFixed(2)}`
        };
      }
    }
  };

  // 计算最高销量用于百分比计算
  const maxSales = data?.top_products?.[0]?.sales || 0;

  return (
    <div style={{ padding: '24px' }}>
      {/* 顶部统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="今日订单数"
              value={data?.today.orders || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">销售额: ¥{data?.today.sales.toFixed(2) || '0.00'}</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="总订单数"
              value={data?.total.orders || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">总销售额: ¥{data?.total.sales.toFixed(2) || '0.00'}</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="库存预警"
              value={data?.low_stock || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: data?.low_stock ? '#ff4d4f' : '#52c41a' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">需要补货的商品数量</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="平均客单价"
              value={data?.total.orders ? (data.total.sales / data.total.orders).toFixed(2) : '0.00'}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">总销售额/总订单数</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 销售趋势图 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <RiseOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            <span>近7天销售趋势</span>
          </div>
        }
        style={{ marginTop: '24px' }}
        loading={loading}
      >
        {data?.sales_trend && (
          <div style={{ height: 400 }}>
            <Area {...areaConfig} />
          </div>
        )}
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        {/* 热销商品榜 */}
        <Col span={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                <span>热销商品TOP5</span>
              </div>
            }
            loading={loading}
          >
            <List
              dataSource={data?.top_products || []}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div 
                        style={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%',
                          background: index < 3 ? '#1890ff' : '#f0f0f0',
                          color: index < 3 ? '#fff' : '#666',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}
                      >
                        {index + 1}
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.name}</span>
                        <span style={{ color: '#1890ff' }}>{item.sales}件</span>
                      </div>
                    }
                    description={
                      <div style={{ marginTop: 8 }}>
                        <div style={{ marginBottom: 4 }}>
                          <Text type="secondary">
                            库存: {item.stock} | 单价: ¥{item.price}
                          </Text>
                        </div>
                        <Progress 
                          percent={maxSales > 0 ? Math.round((item.sales / maxSales) * 100) : 0}
                          strokeColor={{
                            '0%': '#1890ff',
                            '100%': '#69c0ff',
                          }}
                          size="small"
                          showInfo={false}
                        />
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 分类统计 */}
        <Col span={12}>
          <Card title="分类统计" loading={loading}>
            <List
              dataSource={data?.category_stats || []}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.category}
                    description={`商品数量: ${item.count} | 总销量: ${item.total_sales}`}
                  />
                  <div>
                    <Progress 
                      percent={Math.round((item.count / (data?.category_stats.reduce((acc, curr) => acc + curr.count, 0) || 1)) * 100)} 
                      strokeColor="#52c41a"
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 