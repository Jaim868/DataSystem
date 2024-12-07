import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, WarningOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

interface DashboardData {
  monthlySales: {
    month: string;
    total_sales: number;
    order_count: number;
  }[];
  categorySales: {
    category: string;
    sales_count: number;
    category_sales: number;
  }[];
  topProducts: {
    name: string;
    total_quantity: number;
    total_sales: number;
  }[];
}

interface Overview {
  todayOrders: number;
  todaySales: number;
  lowStockCount: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchOverview()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('获���统计数据失败');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const fetchOverview = async () => {
    try {
      const response = await fetch('/api/dashboard/overview');
      if (!response.ok) throw new Error('获取概览数据失败');
      const data = await response.json();
      setOverview(data);
    } catch (error) {
      console.error('获取概览数据失败:', error);
    }
  };

  const salesTrendOption = dashboardData ? {
    title: { text: '月度销售趋势' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dashboardData.monthlySales.map(item => item.month)
    },
    yAxis: { type: 'value' },
    series: [{
      data: dashboardData.monthlySales.map(item => item.total_sales),
      type: 'line',
      smooth: true
    }]
  } : {};

  const categorySalesOption = dashboardData ? {
    title: { text: '商品类别销售占比' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: dashboardData.categorySales.map(item => ({
        value: item.category_sales,
        name: item.category
      }))
    }]
  } : {};

  const topProductsOption = dashboardData ? {
    title: { text: '热销商品TOP5' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dashboardData.topProducts.map(item => item.name)
    },
    yAxis: { type: 'value' },
    series: [{
      data: dashboardData.topProducts.map(item => item.total_quantity),
      type: 'bar'
    }]
  } : {};

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日订单数"
              value={overview?.todayOrders || 0}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日销售额"
              value={overview?.todaySales || 0}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="库存预警商品数"
              value={overview?.lowStockCount || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card>
            <ReactECharts option={salesTrendOption} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card>
            <ReactECharts option={categorySalesOption} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ReactECharts option={topProductsOption} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 