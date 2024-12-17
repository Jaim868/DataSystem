<?php
require_once __DIR__ . '/../utils/Database.php';

class EmployeeController {
    private $db;

    public function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        while (ob_get_level()) {
            ob_end_clean();
        }
        $this->db = Database::getInstance()->getConnection();
    }

    public function getEmployees() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            // 验证用户是否是管理员
            $stmt = $this->db->prepare("
                SELECT role FROM users WHERE id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || $user['role'] !== 'manager') {
                throw new Exception('无权限访问');
            }

            // 获取所有员工信息
            $stmt = $this->db->prepare("
                SELECT 
                    u.id,
                    u.username,
                    u.role,
                    e.store_id,
                    s.name as store_name,
                    e.hire_date,
                    e.salary,
                    e.position,
                    u.created_at
                FROM users u
                LEFT JOIN employees e ON u.id = e.id
                LEFT JOIN stores s ON e.store_id = s.id
                WHERE u.role = 'employee'
                ORDER BY u.created_at DESC
            ");
            $stmt->execute();
            $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 处理数据格式
            foreach ($employees as &$employee) {
                $employee['salary'] = (float)$employee['salary'];
            }

            echo json_encode([
                'success' => true,
                'employees' => $employees
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

    public function addEmployee() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            // 验证用户是否是管理员
            $stmt = $this->db->prepare("
                SELECT role FROM users WHERE id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || $user['role'] !== 'manager') {
                throw new Exception('无权限访问');
            }

            $data = json_decode(file_get_contents('php://input'), true);
            
            // 验证必要字段
            if (!isset($data['username']) || !isset($data['password']) || !isset($data['store_id'])) {
                throw new Exception('缺少必要参数');
            }

            $this->db->beginTransaction();

            // 创建用户账号
            $stmt = $this->db->prepare("
                INSERT INTO users (username, password, role, created_at)
                VALUES (?, ?, 'employee', NOW())
            ");
            $stmt->execute([$data['username'], $data['password']]);
            $employeeId = $this->db->lastInsertId();

            // 创建员工记录
            $stmt = $this->db->prepare("
                INSERT INTO employees (id, store_id, hire_date, salary, position)
                VALUES (?, ?, CURRENT_DATE, ?, ?)
            ");
            $stmt->execute([
                $employeeId,
                $data['store_id'],
                $data['salary'] ?? 0,
                $data['position'] ?? '销售'
            ]);

            $this->db->commit();

            echo json_encode([
                'success' => true,
                'message' => '员工添加成功'
            ]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
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
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            // 验证用户是否是管理员
            $stmt = $this->db->prepare("
                SELECT role FROM users WHERE id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || $user['role'] !== 'manager') {
                throw new Exception('无权限访问');
            }

            $data = json_decode(file_get_contents('php://input'), true);

            $this->db->beginTransaction();

            // 更新用户信息
            if (isset($data['username']) || isset($data['password'])) {
                $updates = [];
                $params = [];
                
                if (isset($data['username'])) {
                    $updates[] = 'username = ?';
                    $params[] = $data['username'];
                }
                if (isset($data['password'])) {
                    $updates[] = 'password = ?';
                    $params[] = $data['password'];
                }
                
                if (!empty($updates)) {
                    $params[] = $id;
                    $stmt = $this->db->prepare("
                        UPDATE users 
                        SET " . implode(', ', $updates) . "
                        WHERE id = ?
                    ");
                    $stmt->execute($params);
                }
            }

            // 更新员工信息
            if (isset($data['store_id']) || isset($data['salary']) || isset($data['position'])) {
                $updates = [];
                $params = [];
                
                if (isset($data['store_id'])) {
                    $updates[] = 'store_id = ?';
                    $params[] = $data['store_id'];
                }
                if (isset($data['salary'])) {
                    $updates[] = 'salary = ?';
                    $params[] = $data['salary'];
                }
                if (isset($data['position'])) {
                    $updates[] = 'position = ?';
                    $params[] = $data['position'];
                }
                
                if (!empty($updates)) {
                    $params[] = $id;
                    $stmt = $this->db->prepare("
                        UPDATE employees 
                        SET " . implode(', ', $updates) . "
                        WHERE id = ?
                    ");
                    $stmt->execute($params);
                }
            }

            $this->db->commit();

            echo json_encode([
                'success' => true,
                'message' => '员工信息更新成功'
            ]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
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
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            // 验证用户是否是管理员
            $stmt = $this->db->prepare("
                SELECT role FROM users WHERE id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || $user['role'] !== 'manager') {
                throw new Exception('无权限访问');
            }

            $this->db->beginTransaction();

            // 删除员工记录
            $stmt = $this->db->prepare("
                DELETE FROM employees WHERE id = ?
            ");
            $stmt->execute([$id]);

            // 删除用户账号
            $stmt = $this->db->prepare("
                DELETE FROM users WHERE id = ?
            ");
            $stmt->execute([$id]);

            $this->db->commit();

            echo json_encode([
                'success' => true,
                'message' => '员工删除成功'
            ]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log('Delete employee error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getInventory() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            // 获取员工所在的商店ID
            $stmt = $this->db->prepare("
                SELECT e.store_id, u.role
                FROM users u
                LEFT JOIN employees e ON u.id = e.id
                WHERE u.id = ?
            ");
            $stmt->execute([$userId]);
            $userInfo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$userInfo || !in_array($userInfo['role'], ['employee', 'manager'])) {
                throw new Exception('无权限访问');
            }

            // 如果是管理员，获取所有商店的库存
            if ($userInfo['role'] === 'manager') {
                $stmt = $this->db->prepare("
                    SELECT 
                        i.id,
                        p.name as product_name,
                        p.description,
                        p.price,
                        i.quantity,
                        s.name as store_name,
                        i.store_id,
                        i.updated_at
                    FROM inventory i
                    JOIN products p ON i.product_id = p.id
                    JOIN stores s ON i.store_id = s.id
                    ORDER BY s.name, p.name
                ");
                $stmt->execute();
            } else {
                // 如果是普通员工，只获取所在商店的库存
                $stmt = $this->db->prepare("
                    SELECT 
                        i.id,
                        p.name as product_name,
                        p.description,
                        p.price,
                        i.quantity,
                        s.name as store_name,
                        i.store_id,
                        i.updated_at
                    FROM inventory i
                    JOIN products p ON i.product_id = p.id
                    JOIN stores s ON i.store_id = s.id
                    WHERE i.store_id = ?
                    ORDER BY p.name
                ");
                $stmt->execute([$userInfo['store_id']]);
            }

            $inventory = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 处理数据格式
            foreach ($inventory as &$item) {
                $item['price'] = (float)$item['price'];
                $item['quantity'] = (int)$item['quantity'];
            }

            echo json_encode([
                'success' => true,
                'inventory' => $inventory
            ]);
        } catch (Exception $e) {
            error_log('Get inventory error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
} 