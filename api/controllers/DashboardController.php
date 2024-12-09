<?php
require_once __DIR__ . '/../utils/Database.php';

class DashboardController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getDashboardStats() {
        try {
            // 获取今日订单数和销售额
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as today_orders,
                    COALESCE(SUM(total_amount), 0) as today_sales
                FROM orders
                WHERE DATE(created_at) = CURDATE()
            ");
            $stmt->execute();
            $todayStats = $stmt->fetch(PDO::FETCH_ASSOC);

            // 获取总订单数和总销售额
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as total_orders,
                    COALESCE(SUM(total_amount), 0) as total_sales
                FROM orders
            ");
            $stmt->execute();
            $totalStats = $stmt->fetch(PDO::FETCH_ASSOC);

            // 获取库存预警商品数
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as low_stock
                FROM products
                WHERE stock < 10 AND deleted_at IS NULL
            ");
            $stmt->execute();
            $lowStock = $stmt->fetch(PDO::FETCH_ASSOC)['low_stock'];

            // 获取最近7天的销售趋势
            $stmt = $this->db->prepare("
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as order_count,
                    SUM(total_amount) as daily_sales
                FROM orders
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            ");
            $stmt->execute();
            $salesTrend = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 获取热销商品TOP5
            $stmt = $this->db->prepare("
                SELECT 
                    p.name,
                    p.sales,
                    p.stock,
                    p.price
                FROM products p
                WHERE p.deleted_at IS NULL
                ORDER BY p.sales DESC
                LIMIT 5
            ");
            $stmt->execute();
            $topProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 获取各分类商品数量
            $stmt = $this->db->prepare("
                SELECT 
                    category,
                    COUNT(*) as count,
                    SUM(sales) as total_sales
                FROM products
                WHERE deleted_at IS NULL
                GROUP BY category
            ");
            $stmt->execute();
            $categoryStats = $stmt->fetchAll(PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode([
                'today' => [
                    'orders' => (int)$todayStats['today_orders'],
                    'sales' => (float)$todayStats['today_sales']
                ],
                'total' => [
                    'orders' => (int)$totalStats['total_orders'],
                    'sales' => (float)$totalStats['total_sales']
                ],
                'low_stock' => (int)$lowStock,
                'sales_trend' => $salesTrend,
                'top_products' => $topProducts,
                'category_stats' => $categoryStats
            ]);
        } catch(PDOException $e) {
            error_log('Dashboard stats error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '获取统计数据失败']);
        }
    }
} 