<?php
require_once __DIR__ . '/../utils/Database.php';

class EmployeeController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getEmployees() {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    id, name, position, email, phone, 
                    hire_date, created_at, updated_at
                FROM employees
                WHERE deleted_at IS NULL
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode($employees);
        } catch(PDOException $e) {
            error_log('Get employees error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '获取员工列表失败']);
        }
    }

    public function addEmployee() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['position'])) {
                http_response_code(400);
                echo json_encode(['error' => '缺少必要参数']);
                return;
            }

            $stmt = $this->db->prepare("
                INSERT INTO employees (
                    name, position, email, phone, hire_date
                ) VALUES (?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $data['name'],
                $data['position'],
                $data['email'] ?? null,
                $data['phone'] ?? null
            ]);

            $id = $this->db->lastInsertId();

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => '员工添加成功',
                'id' => $id
            ]);
        } catch(PDOException $e) {
            error_log('Add employee error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '添加员工失败']);
        }
    }

    public function updateEmployee($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data)) {
                http_response_code(400);
                echo json_encode(['error' => '无效的请求数据']);
                return;
            }

            $updateFields = [];
            $params = [];
            
            foreach(['name', 'position', 'email', 'phone'] as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "`$field` = ?";
                    $params[] = $data[$field];
                }
            }
            
            if (empty($updateFields)) {
                http_response_code(400);
                echo json_encode(['error' => '没有需要更新的字段']);
                return;
            }

            $params[] = $id;
            
            $sql = "UPDATE employees SET " . implode(', ', $updateFields) . 
                   ", updated_at = NOW() WHERE id = ? AND deleted_at IS NULL";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => '员工信息更新成功'
            ]);
        } catch(PDOException $e) {
            error_log('Update employee error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '更新员工信息失败']);
        }
    }

    public function deleteEmployee($id) {
        try {
            $stmt = $this->db->prepare("
                UPDATE employees 
                SET deleted_at = NOW() 
                WHERE id = ? AND deleted_at IS NULL
            ");
            $stmt->execute([$id]);

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => '员工删除成功'
            ]);
        } catch(PDOException $e) {
            error_log('Delete employee error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '删除员工失败']);
        }
    }
} 