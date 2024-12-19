<?php
require_once __DIR__ . '/../utils/Database.php';

class AuthController {
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

    public function login() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            error_log('Login attempt with data: ' . print_r($data, true));
            
            if (!isset($data['username']) || !isset($data['password']) || !isset($data['role'])) {
                throw new Exception('缺少必要的登录信息');
            }

            error_log("Attempting login for username: " . $data['username'] . " with role: " . $data['role']);
            
            // 先检查用户名和密码
            $stmt = $this->db->prepare("
                SELECT id, username, role, password 
                FROM user_auth_view 
                WHERE username = ?
            ");
            $stmt->execute([$data['username']]);
            $user = $stmt->fetch();
            
            error_log("Database query result: " . print_r($user, true));
            
            if (!$user) {
                error_log("User not found");
                echo json_encode([
                    'success' => false,
                    'message' => '用户名或密码错误'
                ]);
                return;
            }

            // 验证密码
            error_log("Comparing passwords - Input: " . $data['password'] . ", Stored: " . $user['password']);
            if ($data['password'] !== $user['password']) {
                error_log("Invalid password");
                echo json_encode([
                    'success' => false,
                    'message' => '用户名或密码错误'
                ]);
                return;
            }

            // 验证角色
            error_log("Comparing roles - Input: " . $data['role'] . ", User role: " . $user['role']);
            if ($data['role'] !== $user['role']) {
                error_log("Role mismatch. Expected: " . $user['role'] . ", Got: " . $data['role']);
                echo json_encode([
                    'success' => false,
                    'message' => '所选角色与用户不匹配'
                ]);
                return;
            }

            // 登录成功
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            
            error_log("Login successful for user: " . $user['username'] . " with role: " . $user['role']);
            
            echo json_encode([
                'success' => true,
                'userId' => $user['id'],
                'role' => $user['role'],
                'username' => $user['username']
            ]);
            
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function logout() {
        try {
            session_destroy();
            echo json_encode(['success' => true]);
        } catch(Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => '服务器错误',
                'error' => $e->getMessage()
            ]);
        }
    }
} 