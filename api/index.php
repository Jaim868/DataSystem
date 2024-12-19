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
require_once __DIR__ . '/controllers/AdminController.php';

// 解析URI
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uriAddEmployee = explode('/', trim($uri, '/'));
array_shift($uriAddEmployee); // 移除 'api'

// 获取HTTP方法
$method = $_SERVER['REQUEST_METHOD'];

try {
    // 处理员工管理路由
    if ($uriAddEmployee[0] === 'admin' && $uriAddEmployee[1] === 'employees') {
        $controller = new EmployeeController();
        
        if (count($uriAddEmployee) === 2) {
            // /api/admin/employees
            switch ($method) {
                case 'GET':
                    $controller->getEmployees();
                    break;
                case 'POST':
                    $controller->addEmployee();
                    break;
                default:
                    throw new Exception('不支持的请求方法');
            }
        } else if (count($uriAddEmployee) === 3 && is_numeric($uriAddEmployee[2])) {
            // /api/admin/employees/{id}
            $id = (int)$uriAddEmployee[2];
            switch ($method) {
                case 'PUT':
                    $controller->updateEmployee($id);
                    break;
                case 'DELETE':
                    $controller->deleteEmployee($id);
                    break;
                default:
                    throw new Exception('不支持的请求方法');
            }
        } else {
            throw new Exception('无效的路由');
        }
        exit;
    }

    // 其他路由处理
    $uri = explode('/', $uri);
    array_shift($uri); // 移除第一个空元素
    array_shift($uri); // 移除 'api'
    
    // 获取完整的资源路径
    $resource = implode('/', $uri);
    
    // 如果最后一个部分是数字，则去掉
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
                // 检查是否是针对特定商店的操作
                if (count($uri) > 2 && is_numeric($uri[2])) {
                    $id = (int)$uri[2];
                    switch ($_SERVER['REQUEST_METHOD']) {
                        case 'PUT':
                            echo json_encode($controller->updateStore($id));
                            break;
                        case 'DELETE':
                            echo json_encode($controller->deleteStore($id));
                            break;
                        default:
                            throw new Exception('不支持的请求方法');
                    }
                } else {
                    // 处理商店列表的操作
                    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                        echo json_encode($controller->getAdminStores());
                    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                        echo json_encode($controller->addStore());
                    } else {
                        throw new Exception('不支持的请求方法');
                    }
                }
                break;
                
            // 产品管理相关路由
            case 'admin/products':
                $controller = new ProductManagementController();
                // 检查是否是针对特定产品的操作
                if (count($uri) > 2 && is_numeric($uri[2])) {
                    $id = (int)$uri[2];
                    
                    // 处理通过 POST 模拟的 PUT 请求
                    $method = $_SERVER['REQUEST_METHOD'];
                    if ($method === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
                        $method = 'PUT';
                    }
                    
                    switch ($method) {
                        case 'GET':
                            echo json_encode($controller->getProduct($id));
                            break;
                        case 'PUT':
                            try {
                                $controller->updateProduct($id);
                            } catch (Exception $e) {
                                http_response_code(500);
                                echo json_encode([
                                    'success' => false,
                                    'error' => $e->getMessage()
                                ]);
                            }
                            break;
                        case 'DELETE':
                            try {
                                $controller->deleteProduct($id);
                            } catch (Exception $e) {
                                http_response_code(500);
                                echo json_encode([
                                    'success' => false,
                                    'error' => $e->getMessage()
                                ]);
                            }
                            break;
                        default:
                            throw new Exception('不支持的请求方法');
                    }
                } else {
                    // 处理产品列表的操作
                    switch ($_SERVER['REQUEST_METHOD']) {
                        case 'GET':
                            try {
                                $products = $controller->getAll();
                                header('Content-Type: application/json');
                                echo json_encode($products);
                            } catch (Exception $e) {
                                http_response_code(500);
                                echo json_encode(['error' => $e->getMessage()]);
                            }
                            break;
                        case 'POST':
                            try {
                                $controller->addProduct();
                            } catch (Exception $e) {
                                http_response_code(500);
                                echo json_encode([
                                    'success' => false,
                                    'error' => $e->getMessage()
                                ]);
                            }
                            break;
                        default:
                            throw new Exception('不支持的请求方法');
                    }
                }
                break;
            
            // 登录由
            case 'login':
                $controller = new AuthController();
                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    $controller->login();
                }
                break;

            // 注册由
            case 'register':
                $controller = new AuthController();
                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    $controller->register();
                }
                break;

            case 'logout':
                $controller = new AuthController();
                if ($_SERVER['REQUEST_METHOD'] === 'POST') { // 登出通常也使用 POST 请求
                    $controller->logout();
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
    
            // 个订单管理
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
    
            // 供应商路由
            case 'supplier/dashboard':
                $controller = new SupplierController();
                if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                    try {
                        error_log('Accessing supplier dashboard');
                        $controller->getDashboard();
                    } catch (Exception $e) {
                        error_log('Supplier dashboard error: ' . $e->getMessage());
                        http_response_code(500);
                        echo json_encode([
                            'success' => false,
                            'error' => $e->getMessage()
                        ]);
                    }
                } else {
                    throw new Exception('不支持的请求方法');
                }
                break;

            case 'supplier/products':
                $controller = new SupplierController();
                if (count($uri) > 2 && is_numeric($uri[2])) {
                    // 处理单个产品的操作
                    $id = (int)$uri[2];
                    error_log('Processing product operation for ID: ' . $id . ', Method: ' . $_SERVER['REQUEST_METHOD']);
                    switch ($_SERVER['REQUEST_METHOD']) {
                        case 'PUT':
                            $controller->updateProduct($id);
                            break;
                        case 'DELETE':
                            try {
                                $controller->deleteProduct($id);
                            } catch (Exception $e) {
                                error_log('Delete product error: ' . $e->getMessage());
                                http_response_code(500);
                                echo json_encode([
                                    'success' => false,
                                    'error' => $e->getMessage()
                                ]);
                            }
                            break;
                        default:
                            throw new Exception('不支持的请求方法');
                    }
                } else {
                    // 处理产品列表的操作
                    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                        $controller->getSupplierProducts();
                    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
                        $controller->addProduct();
                    } else {
                        throw new Exception('不支持的请求方法');
                    }
                }
                break;

            case 'supplier/orders':
                $controller = new SupplierController();
                if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                    $controller->getSupplierOrders();
                } else {
                    throw new Exception('不支持的请求方法');
                }
                break;

            case (preg_match('/^supplier\/orders\/(\w+)\/status$/', $resource, $matches) ? $resource : !$resource):
                $controller = new SupplierController();
                $orderNo = $matches[1];
                if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
                    $controller->updateOrderStatus($orderNo);
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
    
            // 员工库存管理路
            case 'employee/inventory':
                $controller = new EmployeeController();
                switch ($_SERVER['REQUEST_METHOD']) {
                    case 'GET':
                        $controller->getInventory();
                        break;
                    case 'PUT':
                        $id = (int)end($uri);
                        $controller->updateInventory($id);
                        break;
                    default:
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
                $controller = new EmployeeController();
                switch ($_SERVER['REQUEST_METHOD']) {
                    case 'GET':
                        $controller->getOrders();
                        break;
                    case 'PUT':
                        $controller->updateOrderStatus();
                        break;
                    default:
                        throw new Exception('不支持的请求方法');
                }
                break;
    
            // 处理员工管理路由
        
    
            // 管理员库存管理路由
            case 'admin/inventory':
                $controller = new ProductManagementController();
                if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                    $controller->getInventory();
                } else {
                    throw new Exception('不支持的请求方法');
                }
                break;
    
            // 管理员仪表盘路由
            case 'admin/dashboard':
                $controller = new AdminController();
                if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                    $controller->getDashboardStats();
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
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 