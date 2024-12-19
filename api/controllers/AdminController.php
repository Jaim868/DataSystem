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
            
            // 获取最新的统计数据
            $stmt = $this->db->prepare("
                SELECT 
                    COALESCE(SUM(total_completed_sales), 0) as total_sales,
                    MAX(customer_count) as total_users,
                    MAX(store_count) as total_stores
                FROM admin_dashboard_stats_view
                WHERE date = CURDATE()
                GROUP BY date;
            ");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$result) {
                $result = [
                    'total_sales' => 0,
                    'total_users' => 0,
                    'total_stores' => 0
                ];
            }

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => [
                    'totalSales' => (float)$result['total_sales'],
                    'totalUsers' => (int)$result['total_users'],
                    'totalStores' => (int)$result['total_stores']
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
                    date,
                    order_count,
                    daily_sales
                FROM daily_order_stats_view
                WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                ORDER BY date DESC
            ");
            
            echo json_encode($stmt->fetchAll());
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => '获取订单统计失败']);
        }
    }
} 