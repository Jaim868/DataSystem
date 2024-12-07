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
                SELECT id, name, position, email, phone, hire_date
                FROM employees
                WHERE deleted_at IS NULL
            ");
            $stmt->execute();
            $employees = $stmt->fetchAll();

            header('Content-Type: application/json');
            echo json_encode($employees);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function addEmployee() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $this->db->prepare("
                INSERT INTO employees (name, position, email, phone, hire_date)
                VALUES (?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $data['name'],
                $data['position'],
                $data['email'],
                $data['phone']
            ]);

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'id' => $this->db->lastInsertId()
            ]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateEmployee($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $this->db->prepare("
                UPDATE employees 
                SET name = ?, position = ?, email = ?, phone = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $data['name'],
                $data['position'],
                $data['email'],
                $data['phone'],
                $id
            ]);

            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deleteEmployee($id) {
        try {
            $stmt = $this->db->prepare("
                UPDATE employees 
                SET deleted_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$id]);

            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
} 