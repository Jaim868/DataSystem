<?php
require_once __DIR__ . '/../utils/Database.php';

class SupplierController {
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

    public function getSupplierProducts() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            error_log('Current session user ID: ' . var_export($userId, true));
            
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            $stmt = $this->db->prepare("
                SELECT role FROM users WHERE id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user || $user['role'] !== 'supplier') {
                throw new Exception('非供应商用户');
            }

            $stmt = $this->db->prepare("
                SELECT 
                    p.id,
                    p.name,
                    CAST(p.price AS DECIMAL(10,2)) as price,
                    p.description,
                    p.category,
                    p.image_url,
                    p.stock,
                    p.rating,
                    sp.supply_price
                FROM products p
                JOIN supplier_products sp ON p.id = sp.product_id
                WHERE sp.supplier_id = ?
                ORDER BY p.created_at DESC
            ");
            
            error_log('Executing supplier products query for user ID: ' . $userId);
            $stmt->execute([$userId]);
            
            if ($stmt->errorInfo()[0] !== '00000') {
                error_log('SQL Error: ' . print_r($stmt->errorInfo(), true));
                throw new Exception('数据库查询错误: ' . $stmt->errorInfo()[2]);
            }
            
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log('Raw products data: ' . print_r($products, true));

            if (!$products) {
                $products = [];
            }

            foreach ($products as &$product) {
                $product['price'] = (float)$product['price'];
                $product['supply_price'] = (float)$product['supply_price'];
                $product['stock'] = (int)$product['stock'];
                $product['rating'] = $product['rating'] !== null ? (float)$product['rating'] : null;
            }

            error_log('Found ' . count($products) . ' products for supplier');
            error_log('Final formatted data: ' . print_r($products, true));
            
            echo json_encode([
                'success' => true,
                'products' => $products
            ]);
        } catch (Exception $e) {
            error_log('Supplier products error: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            error_log('Session data: ' . print_r($_SESSION, true));
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    public function getDashboard() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            // 获取供应商的统计数据
            $stats = [
                'total_products' => 0,
                'total_orders' => 0,
                'total_sales' => 0,
                'recent_orders' => []
            ];

            // 获取产品总数
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count
                FROM supplier_products sp
                JOIN products p ON sp.product_id = p.id
                WHERE sp.supplier_id = ?
            ");
            $stmt->execute([$userId]);
            $stats['total_products'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // 获取订单总数和销售额
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(DISTINCT o.order_no) as order_count,
                    SUM(oi.quantity * oi.price) as total_sales
                FROM orders o
                JOIN order_items oi ON o.order_no = oi.order_no
                JOIN supplier_products sp ON oi.product_id = sp.product_id
                WHERE sp.supplier_id = ?
            ");
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $stats['total_orders'] = (int)$result['order_count'];
            $stats['total_sales'] = (float)$result['total_sales'];

            // 获取最近的订单
            $stmt = $this->db->prepare("
                SELECT 
                    o.order_no,
                    o.created_at,
                    o.status,
                    GROUP_CONCAT(p.name) as products,
                    SUM(oi.quantity * oi.price) as total_amount
                FROM orders o
                JOIN order_items oi ON o.order_no = oi.order_no
                JOIN products p ON oi.product_id = p.id
                JOIN supplier_products sp ON p.id = sp.product_id
                WHERE sp.supplier_id = ?
                GROUP BY o.order_no, o.created_at, o.status
                ORDER BY o.created_at DESC
                LIMIT 5
            ");
            $stmt->execute([$userId]);
            $stats['recent_orders'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 处理数据格式
            foreach ($stats['recent_orders'] as &$order) {
                $order['total_amount'] = (float)$order['total_amount'];
                $order['products'] = explode(',', $order['products']);
            }

            echo json_encode([
                'success' => true,
                'stats' => $stats
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    public function getSupplierOrders() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            error_log('Current session user ID: ' . var_export($userId, true));
            
            if (!$userId) {
                throw new Exception('用户未登录');
            }

            // 先检查用户是否是供应商
            $stmt = $this->db->prepare("
                SELECT role FROM users WHERE id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user || $user['role'] !== 'supplier') {
                throw new Exception('非供应商用户');
            }

            $query = "
                SELECT 
                    o.order_no,
                    s.name as store_name,
                    p.name as product_name,
                    oi.quantity,
                    sp.supply_price,
                    (oi.quantity * sp.supply_price) as total_amount,
                    o.status,
                    o.created_at
                FROM orders o
                JOIN order_items oi ON o.order_no = oi.order_no
                JOIN products p ON oi.product_id = p.id
                JOIN supplier_products sp ON p.id = sp.product_id
                JOIN stores s ON o.store_id = s.id
                WHERE sp.supplier_id = ?
                ORDER BY o.created_at DESC
            ";
            
            error_log('Executing query: ' . $query);
            error_log('With user ID: ' . $userId);
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            
            // 检查是否有SQL错误
            if ($stmt->errorInfo()[0] !== '00000') {
                error_log('SQL Error: ' . print_r($stmt->errorInfo(), true));
                throw new Exception('数据库查询错误: ' . $stmt->errorInfo()[2]);
            }
            
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log('Raw orders data: ' . print_r($orders, true));

            // 确保返回空数组而不是 null
            if (!$orders) {
                $orders = [];
            }

            // 确保数值类型正确
            foreach ($orders as &$order) {
                $order['supply_price'] = (float)$order['supply_price'];
                $order['total_amount'] = (float)$order['total_amount'];
                $order['quantity'] = (int)$order['quantity'];
            }

            error_log('Found ' . count($orders) . ' orders for supplier');
            error_log('Final formatted data: ' . print_r($orders, true));
            
            echo json_encode([
                'success' => true,
                'orders' => $orders
            ]);
        } catch (Exception $e) {
            error_log('Supplier orders error: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            error_log('Session data: ' . print_r($_SESSION, true));
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
} 