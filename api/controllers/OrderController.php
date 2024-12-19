<?php
require_once __DIR__ . '/../utils/Database.php';

class OrderController {
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

    public function createOrder() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            // 获取用户购物车商品
            $stmt = $this->db->prepare("
                SELECT 
                product_id,
                cart_quantity as quantity,
                price,
                stock,
                name
            FROM cart_management_view
            WHERE user_id = ?
            ");
            $stmt->execute([$userId]);
            $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($cartItems)) {
                throw new Exception('购物车为空');
            }

            $this->db->beginTransaction();

            // 生成订单编号
            $orderNo = date('YmdHis') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

            // 创建订单
            $stmt = $this->db->prepare("
                INSERT INTO orders (order_no, user_id, store_id, total_amount, status, created_at)
                VALUES (?, ?, ?, ?, 'pending', NOW())
            ");

            // 计算总金额
            $totalAmount = array_reduce($cartItems, function($sum, $item) {
                return $sum + ($item['price'] * $item['quantity']);
            }, 0);

            // 获取商店ID（这里简单起见，使用第一个商店）
            $storeId = 1;

            $stmt->execute([$orderNo, $userId, $storeId, $totalAmount]);

            // 添加订单项目
            $stmt = $this->db->prepare("
                INSERT INTO order_items (order_no, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
            ");

            // 更新库存
            $updateStockStmt = $this->db->prepare("
                UPDATE products 
                SET stock = stock - ? 
                WHERE id = ? AND stock >= ?
            ");

            foreach ($cartItems as $item) {
                // 检查库存
                if ($item['stock'] < $item['quantity']) {
                    throw new Exception("商品 {$item['name']} 库存不足");
                }

                // 添加订单项
                $stmt->execute([
                    $orderNo,
                    $item['product_id'],
                    $item['quantity'],
                    $item['price']
                ]);

                // 更新库存
                $updateStockStmt->execute([
                    $item['quantity'],
                    $item['product_id'],
                    $item['quantity']
                ]);
            }

            // 清空购物车
            $stmt = $this->db->prepare("
                DELETE FROM cart_items WHERE user_id = ?
            ");
            $stmt->execute([$userId]);

            $this->db->commit();

            echo json_encode([
                'success' => true,
                'message' => '订单创建成功',
                'orderNo' => $orderNo
            ]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getOrders() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            $stmt = $this->db->prepare("
                SELECT DISTINCT 
                    order_no,
                    total_amount,
                    status,
                    created_at,
                    item_count,
                    product_names
                FROM order_comprehensive_view
                WHERE user_id = ? AND auth_user_id = ?
            ");
            $stmt->execute([$userId, $userId]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 确保数值类型正确
            foreach ($orders as &$order) {
                $order['total_amount'] = (float)$order['total_amount'];
                $order['item_count'] = (int)$order['item_count'];
                
                // 处理商品名称列表
                $order['product_names'] = $order['product_names'] 
                    ? explode(',', $order['product_names']) 
                    : [];
            }

            echo json_encode($orders);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getOrder($orderNo) {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            // 获取订单基本信息
            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    order_no,
                    total_amount,
                    status,
                    created_at
                FROM order_comprehensive_view
                WHERE order_no = ? AND auth_user_id = ? AND has_permission = 1
            ");
            $stmt->execute([$orderNo, $userId]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                throw new Exception('订单不存在');
            }

            // 获取订单项目
            $stmt = $this->db->prepare("
                SELECT 
                    item_id as id,
                    product_id,
                    product_name,
                    image_url,
                    quantity,
                    price
                FROM order_comprehensive_view
                WHERE order_no = ? AND auth_user_id = ? AND has_permission = 1
            ");
            $stmt->execute([$orderNo, $userId]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 确保数值类型正确
            $order['total_amount'] = (float)$order['total_amount'];
            foreach ($items as &$item) {
                $item['price'] = (float)$item['price'];
                $item['quantity'] = (int)$item['quantity'];
            }

            $order['items'] = $items;

            echo json_encode($order);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAdminOrders() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            // 验证用户是否是管理员
            $stmt = $this->db->prepare("
                SELECT DISTINCT auth_user_role as role 
                FROM order_comprehensive_view 
                WHERE auth_user_id = ? AND auth_user_role = 'manager'
                LIMIT 1
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || $user['role'] !== 'manager') {
                throw new Exception('无权限访问');
            }

            // 获取所有订单
            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    order_no,
                    customer_name,
                    total_amount,
                    status,
                    created_at,
                    store_name,
                    item_count,
                    products,
                    quantities,
                    prices
                FROM order_comprehensive_view
                WHERE auth_user_id = ? AND has_permission = 1
                ORDER BY created_at DESC
            ");
            $stmt->execute([$userId]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 处理数据格式
            foreach ($orders as &$order) {
                $order['total_amount'] = (float)$order['total_amount'];
                $order['item_count'] = (int)$order['item_count'];
                
                // 处理订单项目
                $products = explode(',', $order['products']);
                $quantities = array_map('intval', explode(',', $order['quantities']));
                $prices = array_map('floatval', explode(',', $order['prices']));
                
                $order['items'] = array_map(function($product, $quantity, $price) {
                    return [
                        'product_name' => $product,
                        'quantity' => $quantity,
                        'price' => $price
                    ];
                }, $products, $quantities, $prices);
                
                // 移除原始的逗号分隔字段
                unset($order['products']);
                unset($order['quantities']);
                unset($order['prices']);
            }

            echo json_encode($orders);
        } catch (Exception $e) {
            error_log('Admin orders error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    public function updateOrderStatus($orderNo) {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!isset($data['status'])) {
                throw new Exception('缺少状态参数');
            }

            // 验证用户权限（管理员或对应商店的员工）
            $stmt = $this->db->prepare("
                SELECT has_permission
                FROM order_comprehensive_view
                WHERE order_no = ? AND auth_user_id = ?
                LIMIT 1
            ");
            $stmt->execute([$orderNo, $userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || !$user['has_permission']) {
                throw new Exception('无权限操作此订单');
            }

            $stmt = $this->db->prepare("
                UPDATE orders 
                SET status = ?, updated_at = NOW()
                WHERE order_no = ?
            ");
            $stmt->execute([$data['status'], $orderNo]);

            echo json_encode(['success' => true, 'message' => '订单状态更新成功']);
        } catch (Exception $e) {
            error_log('Update order status error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getEmployeeOrders() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            error_log("Employee orders request - User ID: " . ($userId ?? 'null'));
            
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            // 验证用户是否是员工并获取所属商店
            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    auth_user_role as role,
                    customer_name as username,
                    employee_store_id as store_id,
                    store_name
                FROM order_comprehensive_view
                WHERE auth_user_id = ? AND auth_user_role = 'employee'
                LIMIT 1
            ");
            $stmt->execute([$userId]);
            $employee = $stmt->fetch(PDO::FETCH_ASSOC);
            
            error_log("Employee data: " . print_r($employee, true));

            if (!$employee) {
                throw new Exception('用户不是员工');
            }
            
            if (!$employee['store_id']) {
                throw new Exception('员工未关联到任何商店');
            }

            // 获取该商店的所有订单
            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    order_no,
                    customer_name,
                    total_amount,
                    status,
                    created_at,
                    item_count,
                    products,
                    quantities,
                    prices
                FROM order_comprehensive_view
                WHERE store_id = ? AND auth_user_id = ? AND has_permission = 1
                ORDER BY created_at DESC
            ");
            
            error_log("Executing order query for store_id: " . $employee['store_id']);
            $stmt->execute([$employee['store_id'], $userId]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Found " . count($orders) . " orders");

            // 处理数据格式
            foreach ($orders as &$order) {
                $order['total_amount'] = (float)$order['total_amount'];
                $order['item_count'] = (int)$order['item_count'];
                
                // 处理订单项目
                $products = explode(',', $order['products']);
                $quantities = array_map('intval', explode(',', $order['quantities']));
                $prices = array_map('floatval', explode(',', $order['prices']));
                
                $order['items'] = array_map(function($product, $quantity, $price) {
                    return [
                        'product_name' => $product,
                        'quantity' => $quantity,
                        'price' => $price
                    ];
                }, $products, $quantities, $prices);
                
                // 移除原始的逗号分隔字段
                unset($order['products']);
                unset($order['quantities']);
                unset($order['prices']);
            }

            echo json_encode([
                'success' => true,
                'employee' => [
                    'username' => $employee['username'],
                    'store_name' => $employee['store_name'],
                    'store_id' => $employee['store_id']
                ],
                'orders' => $orders
            ]);
            
        } catch (Exception $e) {
            error_log('Employee orders error: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
} 