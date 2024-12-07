<?php
require_once __DIR__ . '/../utils/Database.php';

class AuthController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function login() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // 验证必要字段
            if (!isset($data['username']) || !isset($data['password']) || !isset($data['userType'])) {
                http_response_code(400);
                echo json_encode(['error' => '缺少必要参数']);
                return;
            }

            $stmt = $this->db->prepare("
                SELECT id, username, role
                FROM users 
                WHERE username = ? 
                AND password = ? 
                AND role = ?
                AND deleted_at IS NULL
            ");

            $stmt->execute([
                $data['username'],
                md5($data['password']),
                $data['userType'] === 'admin' ? 'admin' : 'customer'
            ]);

            $user = $stmt->fetch();

            if ($user) {
                // 生成token
                $token = bin2hex(random_bytes(32));
                
                // 更新用户token
                $stmt = $this->db->prepare("
                    UPDATE users 
                    SET token = ?, 
                        updated_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$token, $user['id']]);

                header('Content-Type: application/json');
                echo json_encode([
                    'success' => true,
                    'token' => $token,
                    'userId' => $user['id'],
                    'role' => $user['role'],
                    'username' => $user['username']
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => '用户名或密码错误'
                ]);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => '服务器错误',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function logout() {
        try {
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            if ($token) {
                $token = str_replace('Bearer ', '', $token);
                $stmt = $this->db->prepare("
                    UPDATE users 
                    SET token = NULL,
                        updated_at = NOW()
                    WHERE token = ?
                ");
                $stmt->execute([$token]);
            }
            
            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => '服务器错误',
                'error' => $e->getMessage()
            ]);
        }
    }
} 