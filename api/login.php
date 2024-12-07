<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once './utils/Database.php';

$data = json_decode(file_get_contents('php://input'), true);
error_log('Login attempt: ' . print_r($data, true));

try {
    $db = Database::getInstance()->getConnection();
    
    // 验证用户
    $stmt = $db->prepare("SELECT id, role FROM users WHERE username = ? AND password = ?");
    $stmt->execute([$data['username'], $data['password']]);
    $user = $stmt->fetch();

    if ($user) {
        error_log('Login successful for user: ' . $user['id']);
        
        echo json_encode([
            'success' => true,
            'userId' => $user['id'],
            'role' => $user['role']
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => '用户名或密码错误'
        ]);
    }
} catch(PDOException $e) {
    error_log('Login error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => '服务器错误']);
} 