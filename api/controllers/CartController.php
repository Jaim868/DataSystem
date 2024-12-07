<?php
require_once __DIR__ . '/../utils/Database.php';

class CartController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getCart() {
        try {
            $userId = $_GET['userId'] ?? null;
            
            if (!$userId) {
                http_response_code(401);
                echo json_encode(['error' => '未授权']);
                return;
            }

            // 修改 SQL 查询，确保价格是数字类型
            $stmt = $this->db->prepare("
                SELECT 
                    c.id, 
                    c.product_id, 
                    p.name, 
                    CAST(p.price AS FLOAT) as price, 
                    c.quantity, 
                    p.image_url
                FROM cart_items c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?
            ");
            $stmt->execute([$userId]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode($items);
        } catch(PDOException $e) {
            error_log('Get cart error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function addToCart() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $userId = $data['userId'] ?? null;
            $productId = $data['productId'] ?? null;
            $quantity = $data['quantity'] ?? 1;

            if (!$userId || !$productId) {
                http_response_code(400);
                echo json_encode(['error' => '缺少必要参数']);
                return;
            }

            // 检查商品是否已在购物车中
            $stmt = $this->db->prepare("
                SELECT id, quantity 
                FROM cart_items 
                WHERE user_id = ? AND product_id = ?
            ");
            $stmt->execute([$userId, $productId]);
            $existingItem = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($existingItem) {
                // 更新数量
                $stmt = $this->db->prepare("
                    UPDATE cart_items 
                    SET quantity = quantity + ?
                    WHERE id = ?
                ");
                $stmt->execute([$quantity, $existingItem['id']]);
            } else {
                // 新增商品到购物车
                $stmt = $this->db->prepare("
                    INSERT INTO cart_items (user_id, product_id, quantity)
                    VALUES (?, ?, ?)
                ");
                $stmt->execute([$userId, $productId, $quantity]);
            }

            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            error_log('Add to cart error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getCartCount() {
        try {
            $userId = $_GET['userId'] ?? null;
            
            if (!$userId) {
                http_response_code(401);
                echo json_encode(['error' => '未授权']);
                return;
            }

            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count
                FROM cart_items
                WHERE user_id = ?
            ");
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode(['count' => (int)$result['count']]);
        } catch(PDOException $e) {
            error_log('Get cart count error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
} 