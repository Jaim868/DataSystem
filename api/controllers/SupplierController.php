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
                SELECT DISTINCT role 
                FROM supplier_comprehensive_view 
                WHERE supplier_id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user || $user['role'] !== 'supplier') {
                throw new Exception('非供应商用户');
            }

            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    product_id as id,
                    product_name as name,
                    price,
                    description,
                    category,
                    image_url,
                    stock,
                    rating,
                    supply_price
                FROM supplier_comprehensive_view
                WHERE supplier_id = ?
                ORDER BY product_name
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
            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    total_orders,
                    total_revenue,
                    total_products,
                    low_stock_products
                FROM supplier_comprehensive_view
                WHERE supplier_id = ?
            ");
            $stmt->execute([$userId]);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);

            // 获取最近订单
            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    order_no,
                    product_name,
                    quantity,
                    total_amount,
                    status,
                    order_created_at as created_at
                FROM supplier_comprehensive_view
                WHERE supplier_id = ? AND order_no IS NOT NULL
                ORDER BY order_created_at DESC
                LIMIT 5
            ");
            $stmt->execute([$userId]);
            $recentOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 返回数据
            echo json_encode([
                'success' => true,
                'data' => [
                    'totalProducts' => (int)($stats['total_products'] ?? 0),
                    'totalRevenue' => (float)($stats['total_revenue'] ?? 0),
                    'lowStockProducts' => (int)($stats['low_stock_products'] ?? 0),
                    'recentOrders' => array_map(function($order) {
                        return [
                            'order_no' => $order['order_no'],
                            'product_name' => $order['product_name'],
                            'quantity' => (int)$order['quantity'],
                            'total_amount' => (float)$order['total_amount'],
                            'status' => $order['status'],
                            'created_at' => $order['created_at']
                        ];
                    }, $recentOrders)
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
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
                SELECT DISTINCT role 
                FROM supplier_comprehensive_view 
                WHERE supplier_id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user || $user['role'] !== 'supplier') {
                throw new Exception('非供应商用户');
            }

            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    order_no,
                    store_name,
                    product_name,
                    quantity,
                    supply_price,
                    total_amount,
                    status,
                    order_created_at as created_at
                FROM supplier_comprehensive_view
                WHERE supplier_id = ? AND order_no IS NOT NULL
                ORDER BY order_created_at DESC
            ");
            
            error_log('Executing query for user ID: ' . $userId);
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