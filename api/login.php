<?php
// 添加错误日志
error_reporting(E_ALL);
ini_set('display_errors', 1);
error_log("Login request received");

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/utils/Database.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    error_log('Received login data: ' . print_r($data, true));
    
    if (!isset($data['username']) || !isset($data['password'])) {
        throw new Exception('Missing username or password');
    }

    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("SELECT id, username, role FROM users WHERE username = ? AND password = ?");
    $stmt->execute([$data['username'], $data['password']]);
    
    $user = $stmt->fetch();
    error_log('User data from DB: ' . print_r($user, true));
    
    if ($user) {
        $response = [
            'success' => true,
            'userId' => $user['id'],
            'role' => $user['role']
        ];
        error_log('Sending response: ' . print_r($response, true));
        echo json_encode($response);
    } else {
        echo json_encode([
            'success' => false,
            'message' => '用户名或密码错误'
        ]);
    }
} catch (Exception $e) {
    error_log('Login error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 