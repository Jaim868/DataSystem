<?php
require_once __DIR__ . '/../utils/Database.php';

class SupplierController {
    private $db;

    public function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->db = Database::getInstance()->getConnection();
    }

    private function checkSupplierAuth() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            throw new Exception('用户未登录');
        }

        $stmt = $this->db->prepare("
            SELECT role FROM users 
            WHERE id = ? AND role = 'supplier'
        ");
        $stmt->execute([$userId]);
        if (!$stmt->fetch()) {
            throw new Exception('非供应商用户');
        }

        return $userId;
    }

    public function getSupplierProducts() {
        try {
            $userId = $this->checkSupplierAuth();

            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    p.id,
                    p.name,
                    p.description,
                    p.category,
                    p.image_url,
                    p.price as retail_price,
                    sp.supply_price
                FROM supplier_products sp
                JOIN products p ON sp.product_id = p.id
                WHERE sp.supplier_id = ? AND p.deleted_at IS NULL
                ORDER BY p.name
            ");
            
            $stmt->execute([$userId]);
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($products as &$product) {
                $product['id'] = (int)$product['id'];
                $product['supply_price'] = (float)$product['supply_price'];
                $product['retail_price'] = (float)$product['retail_price'];
            }

            echo json_encode([
                'success' => true,
                'products' => $products
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function addProduct() {
        try {
            $userId = $this->checkSupplierAuth();
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['name']) || !isset($data['supply_price']) || !isset($data['retail_price'])) {
                throw new Exception('缺少必要的字段');
            }

            $this->db->beginTransaction();

            try {
                // 添加商品
                $stmt = $this->db->prepare("
                    INSERT INTO products (
                        name, description, category,
                        price, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, NOW(), NOW())
                ");
                $stmt->execute([
                    $data['name'],
                    $data['description'] ?? '',
                    $data['category'] ?? '未分类',
                    $data['retail_price']
                ]);

                $productId = $this->db->lastInsertId();

                // 添加供应商商品关联
                $stmt = $this->db->prepare("
                    INSERT INTO supplier_products (
                        supplier_id, product_id, supply_price
                    ) VALUES (?, ?, ?)
                ");
                $stmt->execute([
                    $userId,
                    $productId,
                    $data['supply_price']
                ]);

                $this->db->commit();

                echo json_encode([
                    'success' => true,
                    'message' => '商品添加成功',
                    'id' => $productId
                ]);
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function updateProduct($id) {
        try {
            $userId = $this->checkSupplierAuth();
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['name']) || !isset($data['supply_price']) || !isset($data['retail_price'])) {
                throw new Exception('缺少必要的字段');
            }

            $this->db->beginTransaction();

            try {
                // 更新商品基本信息
                $stmt = $this->db->prepare("
                    UPDATE products 
                    SET name = ?, 
                        description = ?,
                        category = ?,
                        price = ?,
                        updated_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([
                    $data['name'],
                    $data['description'] ?? '',
                    $data['category'] ?? '未分类',
                    $data['retail_price'],
                    $id
                ]);

                // 更新供应价格
                $stmt = $this->db->prepare("
                    UPDATE supplier_products 
                    SET supply_price = ?
                    WHERE supplier_id = ? AND product_id = ?
                ");
                $stmt->execute([
                    $data['supply_price'],
                    $userId,
                    $id
                ]);

                $this->db->commit();

                echo json_encode([
                    'success' => true,
                    'message' => '商品更新成功'
                ]);
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function deleteProduct($id) {
        try {
            error_log('Starting deleteProduct method for ID: ' . $id);
            $userId = $this->checkSupplierAuth();
            error_log('User authenticated: ' . $userId);

            $this->db->beginTransaction();
            error_log('Transaction started');

            try {
                // 检查商品是否存在且属于该供应商
                $stmt = $this->db->prepare("
                    SELECT COUNT(*) FROM supplier_products sp
                    JOIN products p ON sp.product_id = p.id
                    WHERE sp.supplier_id = ? AND sp.product_id = ? AND p.deleted_at IS NULL
                ");
                $stmt->execute([$userId, $id]);
                if ($stmt->fetchColumn() === 0) {
                    throw new Exception('商品不存在或无权限删除');
                }
                error_log('Product existence checked');

                // 检查是否有未完成的订单
                $stmt = $this->db->prepare("
                    SELECT COUNT(*) FROM supply_order_items soi
                    JOIN supply_orders so ON soi.order_no = so.order_no
                    WHERE soi.product_id = ? AND so.status IN ('pending', 'processing')
                ");
                $stmt->execute([$id]);
                if ($stmt->fetchColumn() > 0) {
                    throw new Exception('该商品有未完成的订单，无法删除');
                }
                error_log('Order status checked');

                // 删除供应商商品关联
                $stmt = $this->db->prepare("
                    DELETE FROM supplier_products 
                    WHERE supplier_id = ? AND product_id = ?
                ");
                $stmt->execute([$userId, $id]);
                error_log('Supplier product relation deleted');

                // 软删除商品
                $stmt = $this->db->prepare("
                    UPDATE products 
                    SET deleted_at = NOW() 
                    WHERE id = ?
                ");
                $stmt->execute([$id]);
                error_log('Product soft deleted');

                $this->db->commit();
                error_log('Transaction committed');

                echo json_encode([
                    'success' => true,
                    'message' => '商品删除成功'
                ]);
            } catch (Exception $e) {
                error_log('Error in deleteProduct transaction: ' . $e->getMessage());
                error_log('Stack trace: ' . $e->getTraceAsString());
                $this->db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            error_log('Error in deleteProduct: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getSupplierOrders() {
        try {
            $userId = $this->checkSupplierAuth();

            $stmt = $this->db->prepare("
                SELECT 
                    so.order_no,
                    s.name as store_name,
                    s.address as store_address,
                    p.name as product_name,
                    soi.quantity,
                    soi.supply_price,
                    (soi.quantity * soi.supply_price) as total_amount,
                    so.status,
                    so.created_at
                FROM supply_orders so
                JOIN supply_order_items soi ON so.order_no = soi.order_no
                JOIN stores s ON so.store_id = s.id
                JOIN products p ON soi.product_id = p.id
                WHERE so.supplier_id = ?
                ORDER BY so.created_at DESC
            ");
            
            $stmt->execute([$userId]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($orders as &$order) {
                $order['quantity'] = (int)$order['quantity'];
                $order['supply_price'] = (float)$order['supply_price'];
                $order['total_amount'] = (float)$order['total_amount'];
            }

            echo json_encode([
                'success' => true,
                'orders' => $orders
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function updateOrderStatus($orderNo) {
        try {
            $userId = $this->checkSupplierAuth();
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['status'])) {
                throw new Exception('缺少状态参数');
            }

            $validStatuses = ['processing', 'shipping', 'completed', 'cancelled'];
            if (!in_array($data['status'], $validStatuses)) {
                throw new Exception('无效的状态值');
            }

            $this->db->beginTransaction();

            try {
                // 更新订单状态
                $stmt = $this->db->prepare("
                    UPDATE supply_orders 
                    SET status = ?, updated_at = NOW()
                    WHERE order_no = ? AND supplier_id = ?
                ");
                
                $stmt->execute([$data['status'], $orderNo, $userId]);

                if ($stmt->rowCount() === 0) {
                    throw new Exception('订单不存在或无权限更新');
                }

                // 如果订单完成，更新商店库存
                if ($data['status'] === 'completed') {
                    $stmt = $this->db->prepare("
                        SELECT 
                            soi.product_id,
                            soi.quantity,
                            so.store_id
                        FROM supply_order_items soi
                        JOIN supply_orders so ON soi.order_no = so.order_no
                        WHERE so.order_no = ?
                    ");
                    $stmt->execute([$orderNo]);
                    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    foreach ($items as $item) {
                        // 更新商店库存
                        $stmt = $this->db->prepare("
                            INSERT INTO store_inventory (store_id, product_id, quantity)
                            VALUES (?, ?, ?)
                            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
                        ");
                        $stmt->execute([
                            $item['store_id'],
                            $item['product_id'],
                            $item['quantity']
                        ]);
                    }
                }

                $this->db->commit();

                echo json_encode([
                    'success' => true,
                    'message' => '订单状态更新成功'
                ]);
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getDashboard() {
        try {
            $userId = $this->checkSupplierAuth();

            // 获取供应商的统计数据
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(DISTINCT sp.product_id) as total_products,
                    COUNT(DISTINCT so.order_no) as total_orders,
                    COALESCE(SUM(soi.quantity * soi.supply_price), 0) as total_revenue,
                    COUNT(DISTINCT CASE WHEN so.status = 'pending' THEN so.order_no END) as pending_orders,
                    COUNT(DISTINCT CASE WHEN so.status = 'shipping' THEN so.order_no END) as shipping_orders
                FROM supplier_products sp
                LEFT JOIN products p ON sp.product_id = p.id
                LEFT JOIN supply_order_items soi ON p.id = soi.product_id
                LEFT JOIN supply_orders so ON soi.order_no = so.order_no
                WHERE sp.supplier_id = ? AND p.deleted_at IS NULL
            ");
            
            $stmt->execute([$userId]);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);

            // 获取最近订单
            $stmt = $this->db->prepare("
                SELECT 
                    so.order_no,
                    s.name as store_name,
                    s.address as store_address,
                    p.name as product_name,
                    soi.quantity,
                    (soi.quantity * soi.supply_price) as total_amount,
                    so.status,
                    so.created_at
                FROM supply_orders so
                JOIN supply_order_items soi ON so.order_no = soi.order_no
                JOIN stores s ON so.store_id = s.id
                JOIN products p ON soi.product_id = p.id
                WHERE so.supplier_id = ?
                ORDER BY so.created_at DESC
                LIMIT 5
            ");
            
            $stmt->execute([$userId]);
            $recentOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $response = [
                'success' => true,
                'data' => [
                    'totalProducts' => (int)$stats['total_products'],
                    'totalOrders' => (int)$stats['total_orders'],
                    'totalRevenue' => (float)$stats['total_revenue'],
                    'pendingOrders' => (int)$stats['pending_orders'],
                    'shippingOrders' => (int)$stats['shipping_orders'],
                    'recentOrders' => array_map(function($order) {
                        return [
                            'order_no' => $order['order_no'],
                            'store_name' => $order['store_name'],
                            'store_address' => $order['store_address'],
                            'product_name' => $order['product_name'],
                            'quantity' => (int)$order['quantity'],
                            'total_amount' => (float)$order['total_amount'],
                            'status' => $order['status'],
                            'created_at' => $order['created_at']
                        ];
                    }, $recentOrders)
                ]
            ];

            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
} 