<?php
class AuthMiddleware {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function authenticate() {
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => '未授权访问']);
            exit;
        }

        $token = str_replace('Bearer ', '', $token);
        
        $stmt = $this->db->prepare("
            SELECT id, username, role
            FROM users
            WHERE token = ?
            AND deleted_at IS NULL
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => '无效的token']);
            exit;
        }

        return $user;
    }
} 