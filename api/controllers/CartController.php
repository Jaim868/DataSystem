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
            
            if (!isset($data['product_id']) || !isset($data['quantity'])) {
                http_response_code(400);
                echo json_encode(['error' => '缺少必要参数']);
                return;
            }

            // 这里暂时使用固定用户ID，后续需要从登录状态获取
            $userId = 2; // 假设这是默认用户ID
            
            // 检查商品是否存在且有库存
            $stmt = $this->db->prepare("
                SELECT stock FROM products 
                WHERE id = ? AND deleted_at IS NULL
            ");
            $stmt->execute([$data['product_id']]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => '商品不存在']);
                return;
            }
            
            if ($product['stock'] < $data['quantity']) {
                http_response_code(400);
                echo json_encode(['error' => '库存不足']);
                return;
            }

            // 检查购物车是否已有该商品
            $stmt = $this->db->prepare("
                SELECT id, quantity FROM cart_items 
                WHERE user_id = ? AND product_id = ?
            ");
            $stmt->execute([$userId, $data['product_id']]);
            $cartItem = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($cartItem) {
                // 更新数量
                $stmt = $this->db->prepare("
                    UPDATE cart_items 
                    SET quantity = quantity + ?
                    WHERE id = ?
                ");
                $stmt->execute([$data['quantity'], $cartItem['id']]);
            } else {
                // 新增购物车项
                $stmt = $this->db->prepare("
                    INSERT INTO cart_items (user_id, product_id, quantity)
                    VALUES (?, ?, ?)
                ");
                $stmt->execute([$userId, $data['product_id'], $data['quantity']]);
            }

            echo json_encode(['message' => '添加成功']);
        } catch(PDOException $e) {
            error_log('Add to cart error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '添加到购物车失败']);
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