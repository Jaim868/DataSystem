<?php
require_once __DIR__ . '/../utils/Database.php';

class AdminController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function checkAdminAuth() {
        // 检查管理员权限
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => '请先登录']);
            exit;
        }

        $stmt = $this->db->prepare("
            SELECT role FROM users 
            WHERE id = ? AND role = 'admin'
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(403);
            echo json_encode(['error' => '无权限访问']);
            exit;
        }
    }

    public function getDashboardStats() {
        $this->checkAdminAuth();
        
        try {
            // 获取总销售额
            $stmt = $this->db->query("
                SELECT SUM(total_amount) as total_sales
                FROM orders
                WHERE status = 'completed'
            ");
            $totalSales = $stmt->fetch()['total_sales'] ?? 0;

            // 获取总订单数
            $stmt = $this->db->query("
                SELECT COUNT(*) as total_orders
                FROM orders
            ");
            $totalOrders = $stmt->fetch()['total_orders'] ?? 0;

            // 获取商品库存预警数量
            $stmt = $this->db->query("
                SELECT COUNT(*) as low_stock
                FROM products
                WHERE stock < 10 AND deleted_at IS NULL
            ");
            $lowStock = $stmt->fetch()['low_stock'] ?? 0;

            echo json_encode([
                'total_sales' => $totalSales,
                'total_orders' => $totalOrders,
                'low_stock' => $lowStock
            ]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => '获取统计数据失败']);
        }
    }

    public function getOrderStats() {
        $this->checkAdminAuth();
        
        try {
            // 获取最近7天的订单统计
            $stmt = $this->db->query("
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as order_count,
                    SUM(total_amount) as daily_sales
                FROM orders
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            ");
            
            echo json_encode($stmt->fetchAll());
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => '获取订单统计失败']);
        }
    }
} 