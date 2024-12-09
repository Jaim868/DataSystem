<?php
require_once __DIR__ . '/../utils/Database.php';

class StaffController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getStaffList() {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    id,
                    username,
                    role,
                    created_at,
                    last_login
                FROM users
                WHERE role = 'staff' OR role = 'admin'
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $staff = $stmt->fetchAll(PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode($staff);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => '获取员工列表失败']);
        }
    }
} 