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

            error_log('Getting employees - Starting query execution');

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
                    position,
                    DATE_FORMAT(hire_date, '%Y-%m-%d') as hire_date,
                    salary
                FROM employee_comprehensive_view
                ORDER BY user_created_at DESC
            ");
            $stmt->execute();
            $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

            error_log('Raw employee data: ' . print_r($employees, true));

            // 格式化数据
            $formattedEmployees = array_map(function($employee) {
                return [
                    'id' => (int)$employee['id'],
                    'username' => $employee['username'],
                    'email' => $employee['email'],
                    'role' => $employee['role'],
                    'created_at' => $employee['created_at'],
                    'updated_at' => $employee['updated_at'],
                    'store_id' => (int)$employee['store_id'],
                    'store_name' => $employee['store_name'],
                    'position' => $employee['position'],
                    'hire_date' => $employee['hire_date'],
                    'salary' => (float)$employee['salary']
                ];
            }, $employees);

            error_log('Formatted employee data: ' . print_r($formattedEmployees, true));

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => $formattedEmployees
            ]);
        } catch (Exception $e) {
            error_log('Get employees error: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function addEmployee() {
        try {
            // 验证管理员权限
            $this->checkManagerAuth();
            
            // ���取请求数据
            $data = json_decode(file_get_contents('php://input'), true);
            
            // 验证必要字段
            if (!isset($data['username']) || !isset($data['password']) || 
                !isset($data['store_id']) || !isset($data['position']) || 
                !isset($data['salary']) || !isset($data['hire_date'])) {
                throw new Exception('缺少必要参数');
            }

            // 处理日期格式
            $hire_date = date('Y-m-d', strtotime($data['hire_date']));

            // 开始事务
            $this->db->beginTransaction();

            try {
                // 1. 创建用户账号
                $stmt = $this->db->prepare("
                    INSERT INTO users (username, password, role, email, phone)
                    VALUES (?, ?, 'employee', ?, ?)
                ");
                $stmt->execute([
                    $data['username'],
                    $data['password'],
                    $data['email'] ?? null,
                    $data['phone'] ?? null
                ]);
                
                $userId = $this->db->lastInsertId();

                // 2. 创建员工记录
                $stmt = $this->db->prepare("
                    INSERT INTO employees (id, store_id, hire_date, salary, position)
                    VALUES (?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $userId,
                    $data['store_id'],
                    $hire_date,
                    $data['salary'],
                    $data['position']
                ]);

                $this->db->commit();

                echo json_encode([
                    'success' => true,
                    'message' => '员工添加成功'
                ]);
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            error_log('Add employee error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function updateEmployee($id) {
        try {
            // 验证管理员权限
            $this->checkManagerAuth();
            
            // 获取请求数据
            $data = json_decode(file_get_contents('php://input'), true);
            
            // 验证必要字段
            if (!isset($data['store_id']) || !isset($data['position']) || 
                !isset($data['salary']) || !isset($data['hire_date'])) {
                throw new Exception('缺少必要参数');
            }

            // 处理日期格式
            $hire_date = date('Y-m-d', strtotime($data['hire_date']));

            // 开始事务
            $this->db->beginTransaction();

            try {
                // 1. 更新用户信息
                $stmt = $this->db->prepare("
                    UPDATE users 
                    SET username = ?,
                        email = ?,
                        phone = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ");
                $stmt->execute([
                    $data['username'],
                    $data['email'] ?? null,
                    $data['phone'] ?? null,
                    $id
                ]);

                // 2. 更新员工信息
                $stmt = $this->db->prepare("
                    UPDATE employees 
                    SET store_id = ?,
                        hire_date = ?,
                        salary = ?,
                        position = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ");
                $stmt->execute([
                    $data['store_id'],
                    $hire_date,
                    $data['salary'],
                    $data['position'],
                    $id
                ]);

                $this->db->commit();

                echo json_encode([
                    'success' => true,
                    'message' => '员工信息更新成功'
                ]);
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            error_log('Update employee error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function deleteEmployee($id) {
        try {
            // 验证管理员权限
            $this->checkManagerAuth();

            // 开始事务
            $this->db->beginTransaction();

            try {
                // 检查员工是否存在
                $stmt = $this->db->prepare("
                    SELECT e.id, e.store_id, s.name as store_name 
                    FROM employees e
                    JOIN stores s ON e.store_id = s.id
                    WHERE e.id = ?
                ");
                $stmt->execute([$id]);
                $employee = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$employee) {
                    throw new Exception('员工不存在');
                }

                // 检查是否有相关的订单
                $stmt = $this->db->prepare("
                    SELECT COUNT(*) as count FROM orders 
                    WHERE store_id = ?
                ");
                $stmt->execute([$employee['store_id']]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($result['count'] > 0) {
                    throw new Exception("该员工所在商店({$employee['store_name']})存在订单记录，无法删除");
                }

                // 临时关闭外键检查
                $this->db->exec('SET FOREIGN_KEY_CHECKS=0');

                // 1. 删除员工记录
                $stmt = $this->db->prepare("DELETE FROM employees WHERE id = ?");
                if (!$stmt->execute([$id])) {
                    throw new Exception('删除员工记录失败');
                }

                // 2. 删除用户账号
                $stmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
                if (!$stmt->execute([$id])) {
                    throw new Exception('删除用户账号失败');
                }

                // 恢复外键检查
                $this->db->exec('SET FOREIGN_KEY_CHECKS=1');

                $this->db->commit();

                echo json_encode([
                    'success' => true,
                    'message' => '员工删除成功'
                ]);
            } catch (Exception $e) {
                // 确保恢复外键检查
                $this->db->exec('SET FOREIGN_KEY_CHECKS=1');
                $this->db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            error_log('Delete employee error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
} 