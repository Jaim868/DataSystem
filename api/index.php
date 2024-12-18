<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/controllers/ProductController.php';
require_once __DIR__ . '/controllers/StoreController.php';
require_once __DIR__ . '/controllers/ProductManagementController.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/OrderController.php';
require_once __DIR__ . '/controllers/CartController.php';
require_once __DIR__ . '/controllers/SupplierController.php';
require_once __DIR__ . '/controllers/EmployeeController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);
array_shift($uri); // 移除第一个空元素
array_shift($uri); // 移除 'api'

// 获取完整的资源路径
$resource = implode('/', $uri);

// 如果最后一个部分是数字，则去掉它
if (count($uri) > 0 && is_numeric(end($uri))) {
    $resource = implode('/', array_slice($uri, 0, -1));
}

try {
    switch ($resource) {
        // 产品相关路由
        case 'products':
            $controller = new ProductController();
            if (is_numeric(end($uri))) {
                // 获取单个产品详情
                $id = (int)end($uri);
                if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                    try {
                        $result = $controller->getProduct($id);
                        echo json_encode(['success' => true, 'data' => $result]);
                    } catch (Exception $e) {
                        http_response_code(404);
                        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
                    }
                }
            } else {
                // 获取所有产品
                if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                    try {
                        $result = $controller->getAll();
                        echo json_encode($result);
                    } catch (Exception $e) {
                        http_response_code(500);
                        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
                    }
                }
            }
            break;
            
        case 'stores':
            $controller = new StoreController();
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                echo json_encode($controller->getAll());
            }
            break;
            
        case 'admin/stores':
            $controller = new StoreController();
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                echo json_encode($controller->getAdminStores());
            } else {
                throw new Exception('不支持的请求方法');
            }
            break;
            
        // 产品管理相关路由
        case 'admin/products':
            $controller = new ProductManagementController();
            switch ($_SERVER['REQUEST_METHOD']) {
                case 'GET':
                    echo json_encode($controller->getAll());
                    break;
                case 'POST':
                    $controller->addProduct();
                    break;
                default:
                    throw new Exception('不支持的请求方法');
            }
            break;
            
        // 单个产品管理
        case (preg_match('/^admin\/products\/\d+$/', $resource) ? $resource : !$resource):
            $controller = new ProductManagementController();
            $id = (int)$uri[count($uri) - 1];
            switch ($_SERVER['REQUEST_METHOD']) {
                case 'GET':
                    echo json_encode($controller->getProduct($id));
                    break;
                case 'PUT':
                    $controller->updateProduct($id);
                    break;
                case 'DELETE':
                    $controller->deleteProduct($id);
                    break;
                default:
                    throw new Exception('不支持的请求方法');
            }
            break;
            
        // 登录由
        case 'login':
            $controller = new AuthController();
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $controller->login();
            }
            break;
            
        // 购物车路由
        case 'cart':
            $controller = new CartController();
            switch ($_SERVER['REQUEST_METHOD']) {
                case 'GET':
                    $controller->getCart();
                    break;
                case 'POST':
                    $controller->addToCart();
                    break;
                default:
                    throw new Exception('不支持的请求方法');
            }
            break;

        // 购物车项目管理
        case (preg_match('/^cart\/\d+$/', $resource) ? $resource : !$resource):
            $controller = new CartController();
            $id = (int)$uri[count($uri) - 1];
            switch ($_SERVER['REQUEST_METHOD']) {
                case 'PUT':
                    $controller->updateCartItem($id);
                    break;
                case 'DELETE':
                    $controller->removeFromCart($id);
                    break;
                default:
                    throw new Exception('不支持的请求方法');
            }
            break;

        // 订单由
        case 'orders':
            $controller = new OrderController();
            switch ($_SERVER['REQUEST_METHOD']) {
                case 'GET':
                    $controller->getOrders();
                    break;
                case 'POST':
                    $controller->createOrder();
                    break;
                default:
                    throw new Exception('不支持的请求方法');
            }
            break;

        // ��个订单管理
        case (preg_match('/^orders\/\d+$/', $resource) ? $resource : !$resource):
            $controller = new OrderController();
            $id = (int)$uri[count($uri) - 1];
            switch ($_SERVER['REQUEST_METHOD']) {
                case 'GET':
                    $controller->getOrder($id);
                    break;
                case 'PUT':
                    $controller->updateOrderStatus($id);
                    break;
                default:
                    throw new Exception('不支持的请求方法');
            }
            break;

        // 供应商订单路由
        case 'supplier/orders':
            $controller = new SupplierController();
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $controller->getSupplierOrders();
            } else {
                throw new Exception('不支持的请求方法');
            }
            break;

        // 供应商产品路由
        case 'supplier/products':
            $controller = new SupplierController();
            switch ($_SERVER['REQUEST_METHOD']) {
                case 'GET':
                    $controller->getSupplierProducts();
                    break;
                case 'POST':
                    $controller->addProduct();
                    break;
                default:
                    throw new Exception('不支持的请求方法');
            }
            break;

        // 供应商单个产品管理
        case (preg_match('/^supplier\/products\/\d+$/', $resource) ? $resource : !$resource):
            $controller = new SupplierController();
            $id = (int)end($uri);
            switch ($_SERVER['REQUEST_METHOD']) {
                case 'PUT':
                    $controller->updateProduct($id);
                    break;
                case 'DELETE':
                    $controller->deleteProduct($id);
                    break;
                default:
                    throw new Exception('不支持的请求方法');
            }
            break;

        // 供应商仪表盘路由
        case 'supplier/dashboard':
            $controller = new SupplierController();
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $controller->getDashboard();
            } else {
                throw new Exception('不支持的请求方法');
            }
            break;

        // 员工仪表盘路由
        case 'employee/dashboard':
            $controller = new EmployeeController();
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $controller->getDashboard();
            } else {
                throw new Exception('不支持的请求方法');
            }
            break;

        // 员工库存管理路由
        case 'employee/inventory':
            $controller = new EmployeeController();
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $controller->getInventory();
            } else {
                throw new Exception('不支持的请求方法');
            }
            break;

        // 管理员订单路由
        case 'admin/orders':
            $controller = new OrderController();
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $controller->getAdminOrders();
            } else {
                throw new Exception('不支持的请求方法');
            }
            break;

        // 员工订单路由
        case 'employee/orders':
            $controller = new OrderController();
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $controller->getEmployeeOrders();
            } else {
                throw new Exception('不支持的请求方法');
            }
            break;

        // 管理员路由
        case 'admin/employees':
            $controller = new EmployeeController();
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $controller->getEmployees();
            } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $controller->addEmployee();
            } else {
                throw new Exception('不支持的请求方法');
            }
            break;

        case (preg_match('/^admin\/employees\/\d+$/', $resource) ? $resource : !$resource):
            $controller = new EmployeeController();
            $id = (int)$uri[count($uri) - 1];
            if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
                $controller->updateEmployee($id);
            } else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
                $controller->deleteEmployee($id);
            } else {
                throw new Exception('不支持的请求方法');
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => '未找到路由']);
            break;
    }
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 