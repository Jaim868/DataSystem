<?php
require_once __DIR__ . '/../utils/Database.php';

class OrderController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getOrders() {
        try {
            $userId = $_GET['userId'] ?? null;
            
            error_log('Get orders request - userId: ' . $userId);
            
            if (!$userId) {
                http_response_code(400);
                echo json_encode(['error' => '参数错误']);
                return;
            }

            $stmt = $this->db->prepare("
                SELECT 
                    o.order_no,
                    o.total_amount,
                    o.status,
                    o.created_at,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', oi.id,
                            'name', p.name,
                            'price', CAST(oi.price AS FLOAT),
                            'quantity', oi.quantity,
                            'product_id', p.id
                        )
                    ) as items
                FROM orders o
                INNER JOIN order_items oi ON o.order_no = oi.order_no
                INNER JOIN products p ON oi.product_id = p.id
                WHERE o.user_id = ?
                GROUP BY o.order_no, o.total_amount, o.status, o.created_at
                ORDER BY o.created_at DESC
            ");

            $stmt->execute([$userId]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log('Orders found: ' . count($orders));

            foreach($orders as &$order) {
                if ($order['items']) {
                    $order['items'] = json_decode($order['items'], true);
                } else {
                    $order['items'] = [];
                }
            }

            header('Content-Type: application/json');
            echo json_encode($orders);
        } catch(PDOException $e) {
            error_log('Get orders error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error' => '获取订单列表失败',
                'message' => $e->getMessage()
            ]);
        }
    }

    public function updateOrderStatus() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $this->db->prepare("
                UPDATE orders 
                SET status = ?, updated_at = NOW()
                WHERE order_no = ?
            ");
            $stmt->execute([
                $data['status'],
                $data['orderNo']
            ]);

            if ($data['status'] === 'completed') {
                // 更新商品销量
                $stmt = $this->db->prepare("
                    UPDATE products p
                    JOIN order_items oi ON p.id = oi.product_id
                    SET p.sales = p.sales + oi.quantity
                    WHERE oi.order_no = ?
                ");
                $stmt->execute([$data['orderNo']]);
            }

            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function createOrder() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $userId = $_GET['userId'] ?? null;

            // 添加调试日志
            error_log('Create order request - userId: ' . $userId);
            error_log('Order data: ' . print_r($data, true));

            if (!$userId || empty($data['items'])) {
                http_response_code(400);
                echo json_encode(['error' => '参数错误']);
                return;
            }

            $this->db->beginTransaction();

            try {
                // 创建订单
                $orderNo = date('YmdHis') . rand(1000, 9999);
                $stmt = $this->db->prepare("
                    INSERT INTO orders (order_no, user_id, total_amount, status)
                    VALUES (?, ?, ?, 'pending')
                ");
                $stmt->execute([$orderNo, $userId, $data['totalAmount']]);

                // 创建订单项
                $stmt = $this->db->prepare("
                    INSERT INTO order_items (order_no, product_id, quantity, price)
                    VALUES (?, ?, ?, ?)
                ");

                foreach ($data['items'] as $item) {
                    $stmt->execute([
                        $orderNo,
                        $item['product_id'],
                        $item['quantity'],
                        $item['price']
                    ]);
                }

                // 清空购物车
                $stmt = $this->db->prepare("DELETE FROM cart_items WHERE user_id = ?");
                $stmt->execute([$userId]);

                $this->db->commit();
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => true,
                    'orderNo' => $orderNo
                ]);
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
        } catch(PDOException $e) {
            error_log('Create order error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error' => '创建订单失败',
                'message' => $e->getMessage()  // 添加详细错误信息
            ]);
        }
    }
} 