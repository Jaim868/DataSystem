<?php
require_once __DIR__ . '/../utils/Database.php';

class AdminController {
    private $db;

    public function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
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
            WHERE id = ? AND role = 'manager'
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
        try {
            $this->checkAdminAuth();
            
            // 获取总销售额
            $stmt = $this->db->prepare("
                SELECT COALESCE(SUM(total_amount), 0) as total_sales
                FROM orders
                WHERE status = 'completed'
            ");
            $stmt->execute();
            $salesResult = $stmt->fetch(PDO::FETCH_ASSOC);

            // 获取总用户数
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as total_users
                FROM users
                WHERE role = 'customer'
            ");
            $stmt->execute();
            $usersResult = $stmt->fetch(PDO::FETCH_ASSOC);

            // 获取总商店数
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as total_stores
                FROM stores
            ");
            $stmt->execute();
            $storesResult = $stmt->fetch(PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => [
                    'totalSales' => (float)$salesResult['total_sales'],
                    'totalUsers' => (int)$usersResult['total_users'],
                    'totalStores' => (int)$storesResult['total_stores']
                ]
            ]);
        } catch (Exception $e) {
            error_log('Get dashboard stats error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
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