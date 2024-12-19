<?php
require_once __DIR__ . '/../utils/Database.php';

class EmployeeController {
    private $db;

    public function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->db = Database::getInstance()->getConnection();
    }

    private function checkEmployeeAuth() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            throw new Exception('用户未登录');
        }

        $stmt = $this->db->prepare("
            SELECT role FROM user_auth_view 
            WHERE id = ? AND role = 'employee'
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            throw new Exception('非员工用户');
        }

        return $userId;
    }

    private function checkManagerAuth() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            throw new Exception('用户未登录');
        }

        $stmt = $this->db->prepare("
            SELECT role FROM user_auth_view 
            WHERE id = ? AND role = 'manager'
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            throw new Exception('非管理员用户');
        }

        return $userId;
    }

    public function updateOrderStatus() {
        try {
            $this->checkEmployeeAuth();
            
            // 获取请求体数据
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['order_no']) || !isset($data['status'])) {
                throw new Exception('缺少必要参数');
            }

            // 验证订单状态是否有效
            $validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
            if (!in_array($data['status'], $validStatuses)) {
                throw new Exception('无效的订单状态');
            }

            // 更新订单状态
            $stmt = $this->db->prepare("
                UPDATE orders 
                SET status = ?, 
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_no = ?
            ");
            
            $result = $stmt->execute([$data['status'], $data['order_no']]);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => '订单状态更新成功'
                ]);
            } else {
                throw new Exception('订单状态更新失败');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getOrders() {
        try {
            $this->checkEmployeeAuth();
            
            // 获取员工所在商店的订单
            $userId = $_SESSION['user_id'];
            
            // 直接从综合视图获取订单信息
            $stmt = $this->db->prepare("
                SELECT DISTINCT 
                    order_no,
                    total_amount,
                    order_status as status,
                    order_created_at as created_at,
                    customer_name,
                    products,
                    quantities
                FROM employee_comprehensive_view 
                WHERE id = ? AND order_no IS NOT NULL
                ORDER BY order_created_at DESC
            ");
            
            $stmt->execute([$userId]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 处理数据类型
            $formattedOrders = [];
            foreach ($orders as $order) {
                $formattedOrders[] = [
                    'key' => $order['order_no'], // 添加唯一key
                    'order_no' => $order['order_no'],
                    'total_amount' => (float)$order['total_amount'],
                    'status' => $order['status'],
                    'created_at' => $order['created_at'],
                    'customer_name' => $order['customer_name'],
                    'products' => explode(',', $order['products']),
                    'quantities' => array_map('intval', explode(',', $order['quantities']))
                ];
            }

            echo json_encode([
                'success' => true,
                'data' => $formattedOrders // 确保返回的是数组
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getInventory() {
        try {
            $this->checkEmployeeAuth();
            
            // 获取员工所在商店的库存
            $userId = $_SESSION['user_id'];
            
            // 直接从综合视图获取库存信息
            $stmt = $this->db->prepare("
                SELECT DISTINCT 
                    product_id,
                    product_name,
                    description,
                    price,
                    stock,
                    category
                FROM employee_comprehensive_view 
                WHERE id = ? AND stock IS NOT NULL
                ORDER BY category, product_name
            ");
            
            $stmt->execute([$userId]);
            $inventory = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 处理数据类型
            $formattedInventory = array_map(function($item) {
                return [
                    'key' => $item['product_id'],
                    'id' => (int)$item['product_id'],
                    'name' => $item['product_name'],
                    'description' => $item['description'],
                    'price' => (float)$item['price'],
                    'stock' => (int)$item['stock'],
                    'category' => $item['category']
                ];
            }, $inventory);

            echo json_encode([
                'success' => true,
                'data' => $formattedInventory
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function updateInventory($productId) {
        try {
            $this->checkEmployeeAuth();
            
            // 获取员工所在商店
            $userId = $_SESSION['user_id'];
            $stmt = $this->db->prepare("
                SELECT DISTINCT store_id 
                FROM employee_comprehensive_view 
                WHERE id = ? AND store_id IS NOT NULL
                LIMIT 1
            ");
            $stmt->execute([$userId]);
            $employee = $stmt->fetch();
            
            if (!$employee) {
                throw new Exception('找不到员工信息');
            }

            // 获取请求数据
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['stock']) || !is_numeric($data['stock'])) {
                throw new Exception('库存数量无效');
            }

            // 检查商品是否存在于该商店的库存中
            $stmt = $this->db->prepare("
                SELECT 1 
                FROM employee_comprehensive_view 
                WHERE id = ? AND product_id = ? AND stock IS NOT NULL
                LIMIT 1
            ");
            $stmt->execute([$userId, $productId]);
            
            if (!$stmt->fetch()) {
                throw new Exception('商品不存在于当前商店库存中');
            }

            // 更新库存
            $stmt = $this->db->prepare("
                UPDATE store_inventory 
                SET quantity = ?, 
                    updated_at = CURRENT_TIMESTAMP
                WHERE store_id = ? AND product_id = ?
            ");
            
            $result = $stmt->execute([
                $data['stock'],
                $employee['store_id'],
                $productId
            ]);

            if ($result) {
                // 同时更新商品总库存
                $stmt = $this->db->prepare("
                    UPDATE products 
                    SET stock = (
                        SELECT SUM(quantity) 
                        FROM store_inventory 
                        WHERE product_id = ?
                    )
                    WHERE id = ?
                ");
                $stmt->execute([$productId, $productId]);

                echo json_encode([
                    'success' => true,
                    'message' => '库存更新成功'
                ]);
            } else {
                throw new Exception('库存更新失败');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getDashboard() {
        try {
            $this->checkEmployeeAuth();
            
            // 获取员工所在商店
            $userId = $_SESSION['user_id'];
            $stmt = $this->db->prepare("
                SELECT DISTINCT 
                    store_id,
                    store_name,
                    today_orders,
                    today_sales,
                    pending_orders
                FROM employee_comprehensive_view
                WHERE id = ? AND store_id IS NOT NULL
                LIMIT 1
            ");
            $stmt->execute([$userId]);
            $employee = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$employee) {
                throw new Exception('找不到员工信息');
            }

            // 获取最近订单
            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    order_no,
                    customer_name,
                    total_amount,
                    order_status as status,
                    order_created_at as created_at,
                    products,
                    quantities
                FROM employee_comprehensive_view
                WHERE id = ? AND order_no IS NOT NULL
                ORDER BY order_created_at DESC
                LIMIT 5
            ");
            $stmt->execute([$userId]);
            $recentOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 格式化最近订单数据
            $formattedOrders = array_map(function($order) {
                return [
                    'key' => $order['order_no'],
                    'order_no' => $order['order_no'],
                    'customer_name' => $order['customer_name'],
                    'total_amount' => (float)$order['total_amount'],
                    'status' => $order['status'],
                    'created_at' => $order['created_at'],
                    'products' => explode(',', $order['products']),
                    'quantities' => array_map('intval', explode(',', $order['quantities']))
                ];
            }, $recentOrders);

            echo json_encode([
                'success' => true,
                'data' => [
                    'todayOrders' => (int)$employee['today_orders'],
                    'todaySales' => (float)$employee['today_sales'],
                    'pendingOrders' => (int)$employee['pending_orders'],
                    'recentOrders' => $formattedOrders
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getEmployees() {
        try {
            // 验证管理员权限
            $this->checkManagerAuth();

            // 获取所有员工信息
            $stmt = $this->db->prepare("
                SELECT DISTINCT 
                    id,
                    username,
                    email,
                    role,
                    user_created_at as created_at,
                    user_updated_at as updated_at,
                    store_id,
                    store_name,
                    position
                FROM employee_comprehensive_view
                ORDER BY user_created_at DESC
            ");
            $stmt->execute();
            $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => $employees
            ]);
        } catch (Exception $e) {
            error_log('Get employees error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
} 