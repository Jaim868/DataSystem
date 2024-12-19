# API 文档

## 认证相关
### 登录
- 路径: `/api/login`
- 方法: `POST`
- 请求体:  ```json
  {
    "username": "string",
    "password": "string"
  }  ```
- 响应:  ```json
  {
    "success": true,
    "userId": "number",
    "role": "string"
  }  ```

## 产品相关
### 获取所有产品
- 路径: `/api/products`
- 方法: `GET`
- 查询参数: 
  - `store_id`: 可选，指定商店ID
- 响应: 产品列表数组

### 获取单个产品
- 路径: `/api/products/{id}`
- 方法: `GET`
- 响应: 单个产品详情

## 管理员相关
### 获取管理员仪表盘数据
- 路径: `/api/admin/dashboard`
- 方法: `GET`
- 权限: 需要管理员权限
- 响应:  ```json
  {
    "success": true,
    "data": {
      "totalSales": "number",
      "totalUsers": "number",
      "totalStores": "number"
    }
  }  ```

### 获取订单统计
- 路径: `/api/admin/orders`
- 方法: `GET`
- 权限: 需要管理员权限
- 响应: 订单列表数组

### 获取管理员商店列表
- 路径: `/api/admin/stores`
- 方法: `GET`
- 权限: 需要管理员权限
- 响应: ��店列表数组

### 管理员产品管理
#### 获取所有产品
- 路径: `/api/admin/products`
- 方法: `GET`
- 权限: 需要管理员权限
- 响应: 产品列表数组

#### 添加产品
- 路径: `/api/admin/products`
- 方法: `POST`
- 权限: 需要管理员权限
- 请求体: FormData格式，包含产品信息和图片

#### 更新产品
- 路径: `/api/admin/products/{id}`
- 方法: `PUT`
- 权限: 需要管理员权限
- 请求体: FormData格式，包含产品信息和图片

#### 删除产品
- 路径: `/api/admin/products/{id}`
- 方法: `DELETE`
- 权限: 需要管理员权限

### 管理员库存管理
- 路径: `/api/admin/inventory`
- 方法: `GET`
- 权限: 需要管理员权限
- 响应: 库存信息数组

## 员工相关
### 获取员工仪表盘
- 路径: `/api/employee/dashboard`
- 方法: `GET`
- 权限: 需要员工权限
- 响应: 员工仪表盘数据

### 员工库存管理
#### 获取库存
- 路径: `/api/employee/inventory`
- 方法: `GET`
- 权限: 需要员工权限
- 响应: 库存信息数组

#### 更新库存
- 路径: `/api/employee/inventory/{id}`
- 方法: `PUT`
- 权限: 需要员工权限
- 请求体:  ```json
  {
    "stock": "number"
  }  ```

### 员工订单管理
#### 获取订单列表
- 路径: `/api/employee/orders`
- 方法: `GET`
- 权��: 需要员工权限
- 响应: 订单列表数组

#### 更新订单状态
- 路径: `/api/employee/orders`
- 方法: `PUT`
- 权限: 需要员工权限
- 请求体: 包含订单状态信息

## 供应商相关
### 获取供应商产品
- 路径: `/api/supplier/products`
- 方法: `GET`
- 权限: 需要供应商权限
- 响应: 供应商产品列表

### 获取供应商订单
- 路径: `/api/supplier/orders`
- 方法: `GET`
- 权限: 需要供应商权限
- 响应: 供应商订单列表

### 供应商产品管理
#### 添加产品
- 路径: `/api/supplier/products`
- 方法: `POST`
- 权限: 需要供应商权限
- 请求体: 产品信息

#### 更新产品
- 路径: `/api/supplier/products/{id}`
- 方法: `PUT`
- 权限: 需要供应商权限
- 请求体: 产品信息

#### 删除产品
- 路径: `/api/supplier/products/{id}`
- 方法: `DELETE`
- 权限: 需要供应商权限

## 购物车相关
### 获取购物车
- 路径: `/api/cart`
- 方法: `GET`
- 权限: 需要用户登录
- 响应: 购物车商品列表

### 添加商品到购物车
- 路径: `/api/cart`
- 方法: `POST`
- 权限: 需要用户登录
- 请求体:  ```json
  {
    "product_id": "number",
    "quantity": "number"
  }  ```

### 更新购物车商品
- 路径: `/api/cart/{id}`
- 方法: `PUT`
- 权限: 需要用户��录
- 请求体: 包含更新的数量信息

### 删除购物车商品
- 路径: `/api/cart/{id}`
- 方法: `DELETE`
- 权限: 需要用户登录

## 订单相关
### 获取订单列表
- 路径: `/api/orders`
- 方法: `GET`
- 权限: 需要用户登录
- 响应: 订单列表

### 创建订单
- 路径: `/api/orders`
- 方法: `POST`
- 权限: 需要用户登录
- 请求体: 订单信息

### 获取订单详情
- 路径: `/api/orders/{id}`
- 方法: `GET`
- 权限: 需要用户登录
- 响应: 订单详细信息

### 更新订单状态
- 路径: `/api/orders/{id}`
- 方法: `PUT`
- 权限: 需要用户登录
- 请求体: 包含订单状态信息

## 员工管理
### 获取员工列表
- 路径: `/api/admin/employees`
- 方法: `GET`
- 权限: 需要管理员权限
- 响应: 员工列表数组

### 添加员工
- 路径: `/api/admin/employees`
- 方法: `POST`
- 权限: 需要管理员权限
- 请求体: 员工信息

### 更新员工信息
- 路径: `/api/admin/employees/{id}`
- 方法: `PUT`
- 权限: 需要管理员权限
- 请求体: 员工信息

### 删除员工
- 路径: `/api/admin/employees/{id}`
- 方法: `DELETE`
- 权限: 需要管理员权限
