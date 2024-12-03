import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { Line, Column, Pie } from '@ant-design/charts';
import { ShoppingCartOutlined, UserOutlined, DollarOutlined, InboxOutlined } from '@ant-design/icons';

const Dashboard = () => {
  // 销售趋势数据
  const salesData = [
    { month: '1月', sales: 3500 },
    { month: '2月', sales: 4200 },
    { month: '3月', sales: 3800 },
    { month: '4月', sales: 5000 },
    { month: '5月', sales: 4800 },
    { month: '6月', sales: 6000 },
  ];

  // 商品类别销售占比
  const categoryData = [
    { category: '鱼竿', value: 40 },
    { category: '鱼线', value: 25 },
    { category: '鱼钩', value: 20 },
    { category: '其他配件', value: 15 },
  ];

  // 热销商品排行
  const topProductsData = [
    { product: '碳素鱼竿', sales: 120 },
    { product: '进口渔线', sales: 86 },
    { product: '专业鱼钩', sales: 72 },
    { product: '渔具包', sales: 65 },
    { product: '浮漂', sales: 53 },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日销售额"
              value={2893}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日订单数"
              value={28}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="新增客户"
              value={12}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存预警"
              value={5}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={16}>
          <Card title="销售趋势">
            <Line
              data={salesData}
              xField="month"
              yField="sales"
              point={{
                size: 5,
                shape: 'diamond',
              }}
              label={{
                style: {
                  fill: '#aaa',
                },
              }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="商品类别销售占比">
            <Pie
              data={categoryData}
              angleField="value"
              colorField="category"
              radius={0.8}
              label={{
                type: 'outer',
                content: '{name} {percentage}',
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="热销商品排行">
            <Column
              data={topProductsData}
              xField="product"
              yField="sales"
              label={{
                position: 'top',
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 