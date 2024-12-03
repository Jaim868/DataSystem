import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ShoppingCartOutlined, UserOutlined, DollarOutlined, InboxOutlined } from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';

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

  const lineOption = {
    xAxis: {
      type: 'category',
      data: salesData.map(item => item.month)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: salesData.map(item => item.sales),
      type: 'line'
    }]
  };

  const pieOption = {
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 40, name: '鱼竿' },
        { value: 25, name: '鱼线' },
        { value: 20, name: '鱼钩' },
        { value: 15, name: '其他配件' }
      ]
    }]
  };

  const barOption = {
    xAxis: {
      type: 'category',
      data: ['碳素鱼竿', '进口渔线', '专业鱼钩', '渔具包', '浮漂']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [120, 86, 72, 65, 53],
      type: 'bar'
    }]
  };

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
            <Line option={lineOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="商品类别销售占比">
            <Pie option={pieOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="热销商品排行">
            <Column option={barOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 