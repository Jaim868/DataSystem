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
            // 通过请求路径判断是否为管理员访问
            $isAdmin = strpos($_SERVER['REQUEST_URI'], '/api/admin/') === 0;
            
            // 管理员可以查看所有订单，普通用户只能查看自己的订单
            $sql = "
                SELECT 
                    o.order_no,
                    o.total_amount,
                    o.status,
                    o.created_at,
                    u.username as customer_name,
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
                INNER JOIN users u ON o.user_id = u.id
            ";

            if (!$isAdmin && $userId) {
                $sql .= " WHERE o.user_id = ?";
            }

            $sql .= " GROUP BY o.order_no, o.total_amount, o.status, o.created_at, u.username
                      ORDER BY o.created_at DESC";

            $stmt = $this->db->prepare($sql);
            
            if (!$isAdmin && $userId) {
                $stmt->execute([$userId]);
            } else {
                $stmt->execute();
            }

            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 处理订单项的 JSON 数据
            foreach ($orders as &$order) {
                $order['items'] = json_decode($order['items'], true);
                $order['total_amount'] = floatval($order['total_amount']);
            }

            header('Content-Type: application/json');
            echo json_encode($orders);
        } catch(Exception $e) {
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
            $this->db->beginTransaction();
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            // 获取订单当前状态
            $stmt = $this->db->prepare("
                SELECT status FROM orders WHERE order_no = ?
            ");
            $stmt->execute([$data['orderNo']]);
            $currentStatus = $stmt->fetch(PDO::FETCH_ASSOC)['status'];

            // 只有从未发货状态改为已发货状态时才需要更新库存
            if ($currentStatus === 'pending' && $data['status'] === 'shipped') {
                // 获取订单项并更新库存
                $stmt = $this->db->prepare("
                    SELECT oi.product_id, oi.quantity
                    FROM order_items oi
                    WHERE oi.order_no = ?
                ");
                $stmt->execute([$data['orderNo']]);
                $orderItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // 更新每个商品的库存和销量
                foreach ($orderItems as $item) {
                    $stmt = $this->db->prepare("
                        UPDATE products 
                        SET 
                            stock = stock - ?,
                            sales = sales + ?,
                            updated_at = NOW()
                        WHERE id = ? AND stock >= ?
                    ");
                    $result = $stmt->execute([
                        $item['quantity'],
                        $item['quantity'],
                        $item['product_id'],
                        $item['quantity']
                    ]);

                    if (!$result) {
                        throw new Exception('库存不足');
                    }
                }
            }

            // 更新订单状态
            $stmt = $this->db->prepare("
                UPDATE orders 
                SET status = ?, updated_at = NOW()
                WHERE order_no = ?
            ");
            $stmt->execute([
                $data['status'],
                $data['orderNo']
            ]);

            $this->db->commit();
            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
        } catch(Exception $e) {
            $this->db->rollBack();
            error_log('Update order status error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error' => '更新订单状态失败',
                'message' => $e->getMessage()
            ]);
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