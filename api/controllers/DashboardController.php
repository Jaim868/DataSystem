<?php
require_once __DIR__ . '/../utils/Database.php';

class DashboardController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getSalesStats() {
        try {
            // 获取月度销售数据
            $stmt = $this->db->prepare("
                SELECT 
                    DATE_FORMAT(o.create_time, '%Y-%m') as month,
                    SUM(o.total_amount) as total_sales,
                    COUNT(DISTINCT o.order_no) as order_count
                FROM orders o
                WHERE o.create_time >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(o.create_time, '%Y-%m')
                ORDER BY month ASC
            ");
            $stmt->execute();
            $monthlySales = $stmt->fetchAll();

            // 获取商品类别销售占比
            $stmt = $this->db->prepare("
                SELECT 
                    p.category,
                    COUNT(*) as sales_count,
                    SUM(oi.price * oi.quantity) as category_sales
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                GROUP BY p.category
            ");
            $stmt->execute();
            $categorySales = $stmt->fetchAll();

            // 获取热销商品
            $stmt = $this->db->prepare("
                SELECT 
                    p.name,
                    SUM(oi.quantity) as total_quantity,
                    SUM(oi.price * oi.quantity) as total_sales
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                GROUP BY p.id
                ORDER BY total_quantity DESC
                LIMIT 5
            ");
            $stmt->execute();
            $topProducts = $stmt->fetchAll();

            header('Content-Type: application/json');
            echo json_encode([
                'monthlySales' => $monthlySales,
                'categorySales' => $categorySales,
                'topProducts' => $topProducts
            ]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getOverview() {
        try {
            // 获取今日订单数
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as today_orders
                FROM orders
                WHERE DATE(create_time) = CURDATE()
            ");
            $stmt->execute();
            $todayOrders = $stmt->fetch()['today_orders'];

            // 获取今日销售额
            $stmt = $this->db->prepare("
                SELECT COALESCE(SUM(total_amount), 0) as today_sales
                FROM orders
                WHERE DATE(create_time) = CURDATE()
            ");
            $stmt->execute();
            $todaySales = $stmt->fetch()['today_sales'];

            // 获取库存预警商品数
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as low_stock_count
                FROM products
                WHERE stock < 10 AND deleted_at IS NULL
            ");
            $stmt->execute();
            $lowStockCount = $stmt->fetch()['low_stock_count'];

            header('Content-Type: application/json');
            echo json_encode([
                'todayOrders' => $todayOrders,
                'todaySales' => $todaySales,
                'lowStockCount' => $lowStockCount
            ]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
} 