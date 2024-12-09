<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once './controllers/ProductController.php';
require_once './controllers/CartController.php';
require_once './controllers/OrderController.php';
require_once './utils/Database.php';

$requestMethod = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', trim($uri, '/'));

// 实例化控制器
$productController = new ProductController();
$cartController = new CartController();
$orderController = new OrderController();

// 路由处理
if ($uri[0] === 'api') {
    // 登录接口
    if ($uri[1] === 'login') {
        require './login.php';
        exit;
    }
    
    switch ($uri[1]) {
        case 'products':
            if ($requestMethod === 'GET') {
                if (isset($uri[2])) {
                    $productController->getProduct($uri[2]);
                } else {
                    $productController->getProducts();
                }
            } else if ($requestMethod === 'POST') {
                $productController->createProduct();
            } else if ($requestMethod === 'PUT' && isset($uri[2])) {
                $productController->updateProduct($uri[2]);
            } else if ($requestMethod === 'DELETE' && isset($uri[2])) {
                $productController->deleteProduct($uri[2]);
            }
            break;
            
        case 'cart':
            if ($requestMethod === 'GET') {
                if (isset($uri[2]) && $uri[2] === 'count') {
                    $cartController->getCartCount();
                } else {
                    $cartController->getCart();
                }
            } else if ($requestMethod === 'POST') {
                $cartController->addToCart();
            }
            break;
            
        case 'orders':
            if ($requestMethod === 'GET') {
                $orderController->getOrders();
            } else if ($requestMethod === 'POST') {
                $orderController->createOrder();
            }
            break;
            
        case 'admin':
            require_once './controllers/DashboardController.php';
            require_once './controllers/EmployeeController.php';
            require_once './controllers/ProductManagementController.php';
            
            $dashboardController = new DashboardController();
            $employeeController = new EmployeeController();
            $productManagementController = new ProductManagementController();
            
            if ($uri[2] === 'dashboard') {
                $dashboardController->getDashboardStats();
            } else if ($uri[2] === 'employees') {
                if ($requestMethod === 'GET') {
                    $employeeController->getEmployees();
                } else if ($requestMethod === 'POST') {
                    $employeeController->addEmployee();
                } else if ($requestMethod === 'PUT' && isset($uri[3])) {
                    $employeeController->updateEmployee($uri[3]);
                } else if ($requestMethod === 'DELETE' && isset($uri[3])) {
                    $employeeController->deleteEmployee($uri[3]);
                }
            } else if ($uri[2] === 'products') {
                if ($requestMethod === 'GET') {
                    $productManagementController->getProducts();
                } else if ($requestMethod === 'POST') {
                    if (isset($_POST['_method']) && $_POST['_method'] === 'PUT' && isset($uri[3])) {
                        $productManagementController->updateProduct($uri[3]);
                    } else {
                        $productManagementController->addProduct();
                    }
                } else if ($requestMethod === 'DELETE' && isset($uri[3])) {
                    $productManagementController->deleteProduct($uri[3]);
                }
            } else if ($uri[2] === 'orders') {
                if ($requestMethod === 'GET') {
                    $orderController->getOrders();
                } else if ($requestMethod === 'POST' && $uri[3] === 'status') {
                    $orderController->updateOrderStatus();
                }
            } else if ($uri[2] === 'inventory') {
                if ($requestMethod === 'GET') {
                    $productManagementController->getProducts();
                } else if ($requestMethod === 'POST' && isset($uri[3]) && $uri[4] === 'stock') {
                    $productManagementController->updateStock($uri[3]);
                }
            }
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => '未找到路由']);
            break;
    }
} 