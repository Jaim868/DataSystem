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
            
        default:
            http_response_code(404);
            echo json_encode(['error' => '未找到路由']);
            break;
    }
} 