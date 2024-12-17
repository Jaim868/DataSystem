<?php
require_once __DIR__ . '/../utils/Database.php';

class CartController {
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

    public function getCart() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            $stmt = $this->db->prepare("
                SELECT 
                    c.id as cart_id,
                    c.quantity,
                    p.id as product_id,
                    p.name,
                    p.price,
                    p.image_url,
                    p.stock
                FROM cart_items c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?
            ");
            $stmt->execute([$userId]);
            $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($cartItems as &$item) {
                $item['price'] = (float)$item['price'];
                $item['quantity'] = (int)$item['quantity'];
            }

            echo json_encode($cartItems);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function addToCart() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!isset($data['product_id']) || !isset($data['quantity'])) {
                throw new Exception('缺少必要参数');
            }

            // 检查商品是否存在且有库存
            $stmt = $this->db->prepare("
                SELECT stock FROM products WHERE id = ?
            ");
            $stmt->execute([$data['product_id']]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$product) {
                throw new Exception('商品不存在');
            }

            if ($product['stock'] < $data['quantity']) {
                throw new Exception('商品库存不足');
            }

            // 检查购物车是否已有此商品
            $stmt = $this->db->prepare("
                SELECT id, quantity FROM cart_items 
                WHERE user_id = ? AND product_id = ?
            ");
            $stmt->execute([$userId, $data['product_id']]);
            $existingItem = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->db->beginTransaction();

            if ($existingItem) {
                // 更新数量
                $newQuantity = $existingItem['quantity'] + $data['quantity'];
                $stmt = $this->db->prepare("
                    UPDATE cart_items 
                    SET quantity = ?
                    WHERE id = ?
                ");
                $stmt->execute([$newQuantity, $existingItem['id']]);
            } else {
                // 新增购物车项
                $stmt = $this->db->prepare("
                    INSERT INTO cart_items (user_id, product_id, quantity)
                    VALUES (?, ?, ?)
                ");
                $stmt->execute([$userId, $data['product_id'], $data['quantity']]);
            }

            $this->db->commit();
            echo json_encode(['success' => true, 'message' => '添加成功']);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateCartItem($id) {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!isset($data['quantity'])) {
                throw new Exception('缺少数量参数');
            }

            $stmt = $this->db->prepare("
                UPDATE cart_items 
                SET quantity = ?, updated_at = NOW()
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$data['quantity'], $id, $userId]);

            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function removeFromCart($id) {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            $stmt = $this->db->prepare("
                DELETE FROM cart_items 
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$id, $userId]);

            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
} 