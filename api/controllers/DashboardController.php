<?php
require_once __DIR__ . '/../utils/Database.php';

class DashboardController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getDashboardStats() {
        try {
            // 使用manager_view获取统计数据
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(DISTINCT mv.order_no) as total_orders,
                    SUM(mv.total_amount) as total_sales,
                    COUNT(DISTINCT CASE WHEN mv.stock_quantity < 10 THEN mv.product_id END) as low_stock
                FROM manager_view mv
            ");
            $stmt->execute();
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);

            // 获取销售趋势
            $stmt = $this->db->prepare("
                SELECT 
                    DATE(mv.order_date) as date,
                    COUNT(DISTINCT mv.order_no) as order_count,
                    SUM(mv.total_amount) as daily_sales
                FROM manager_view mv
                WHERE mv.order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(mv.order_date)
                ORDER BY date DESC
            ");
            $stmt->execute();
            $salesTrend = $stmt->fetchAll(PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode([
                'stats' => $stats,
                'salesTrend' => $salesTrend
            ]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => '获取仪表盘数据失败']);
        }
    }
} 