# MixMall API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Bearer token authentication is used. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Admin Authentication

### Login
```http
POST /admin/login
```

**Request Body**
```json
{
    "email": "admin@mixmall.uz",
    "password": "Admin123!"
}
```

**Success Response (200)**
```json
{
    "success": true,
    "data": {
        "token": "jwt_token_here",
        "admin": {
            "id": "admin_id",
            "email": "admin@mixmall.uz",
            "firstName": "Admin",
            "lastName": "User",
            "role": "admin",
            "status": "active",
            "permissions": [
                "view_dashboard",
                "manage_products",
                "manage_categories",
                "manage_brands",
                "manage_orders",
                "view_statistics"
            ],
            "createdAt": "2025-01-17T11:03:04.330Z",
            "updatedAt": "2025-01-17T11:03:04.330Z",
            "lastLoginAt": null
        }
    }
}
```

**Error Response (401)**
```json
{
    "success": false,
    "message": "Email yoki parol noto'g'ri"
}
```

### Get Current Admin
```http
GET /admin/me
```

**Success Response (200)**
```json
{
    "success": true,
    "data": {
        "admin": {
            "id": "admin_id",
            "email": "admin@mixmall.uz",
            "firstName": "Admin",
            "lastName": "User",
            "role": "admin",
            "status": "active",
            "permissions": [
                "view_dashboard",
                "manage_products",
                "manage_categories",
                "manage_brands",
                "manage_orders",
                "view_statistics"
            ]
        }
    }
}
```

### Change Password
```http
PUT /admin/me/change-password
```

**Request Body**
```json
{
    "currentPassword": "current_password",
    "newPassword": "new_password"
}
```

**Success Response (200)**
```json
{
    "success": true,
    "message": "Parol muvaffaqiyatli o'zgartirildi"
}
```

## Super Admin Operations

### Get All Admins
```http
GET /admin
```

**Success Response (200)**
```json
{
    "success": true,
    "data": {
        "admins": [
            {
                "id": "admin_id",
                "email": "admin@mixmall.uz",
                "firstName": "Admin",
                "lastName": "User",
                "role": "admin",
                "status": "active",
                "permissions": ["..."],
                "createdAt": "2025-01-17T12:41:58.000Z",
                "updatedAt": "2025-01-17T12:41:58.000Z"
            }
        ],
        "total": 1
    }
}
```

### Register New Admin
```http
POST /admin/register
```

**Request Body**
```json
{
    "email": "newadmin@mixmall.uz",
    "password": "Admin123!",
    "firstName": "New",
    "lastName": "Admin",
    "role": "admin",
    "permissions": [
        "view_dashboard",
        "manage_products",
        "manage_categories",
        "manage_brands",
        "manage_orders",
        "view_statistics"
    ]
}
```

**Success Response (201)**
```json
{
    "success": true,
    "data": {
        "admin": {
            "id": "admin_id",
            "email": "newadmin@mixmall.uz",
            "firstName": "New",
            "lastName": "Admin",
            "role": "admin",
            "status": "active",
            "permissions": ["..."],
            "createdAt": "2025-01-17T12:41:58.000Z",
            "updatedAt": "2025-01-17T12:41:58.000Z"
        }
    }
}
```

### Get Admin by ID
```http
GET /admin/:id
```

**Success Response (200)**
```json
{
    "success": true,
    "data": {
        "admin": {
            "id": "admin_id",
            "email": "admin@mixmall.uz",
            "firstName": "Admin",
            "lastName": "User",
            "role": "admin",
            "status": "active",
            "permissions": ["..."],
            "createdAt": "2025-01-17T12:41:58.000Z",
            "updatedAt": "2025-01-17T12:41:58.000Z"
        }
    }
}
```

### Update Admin
```http
PUT /admin/:id
```

**Request Body**
```json
{
    "firstName": "Updated",
    "lastName": "Admin",
    "status": "active",
    "permissions": [
        "view_dashboard",
        "manage_products",
        "manage_categories",
        "manage_brands",
        "manage_orders",
        "view_statistics"
    ]
}
```

**Success Response (200)**
```json
{
    "success": true,
    "data": {
        "admin": {
            "id": "admin_id",
            "email": "admin@mixmall.uz",
            "firstName": "Updated",
            "lastName": "Admin",
            "role": "admin",
            "status": "active",
            "permissions": ["..."],
            "updatedAt": "2025-01-17T12:41:58.000Z"
        }
    }
}
```

### Delete Admin
```http
DELETE /admin/:id
```

**Success Response (200)**
```json
{
    "success": true,
    "message": "Admin muvaffaqiyatli o'chirildi"
}
```

## Available Permissions

### Dashboard
- `view_dashboard` - Dashboard ko'rish

### Products (Mahsulotlar)
- `manage_products` - Mahsulotlarni boshqarish
- `manage_categories` - Kategoriyalarni boshqarish
- `manage_brands` - Brendlarni boshqarish

### Orders (Buyurtmalar)
- `manage_orders` - Buyurtmalarni boshqarish
- `manage_shipping` - Yetkazib berishni boshqarish
- `manage_payments` - To'lovlarni boshqarish

### Users (Foydalanuvchilar)
- `manage_users` - Foydalanuvchilarni boshqarish
- `manage_admins` - Adminlarni boshqarish

### Marketing
- `manage_banners` - Bannerlarni boshqarish

### Content (Kontent)
- `manage_reviews` - Sharhlarni boshqarish

### Support (Qo'llab-quvvatlash)
- `manage_feedback` - Fikr-mulohazalarni boshqarish
- `manage_notifications` - Bildirishnomalarni boshqarish

### Reports (Hisobotlar)
- `view_statistics` - Statistikani ko'rish
- `manage_reports` - Hisobotlarni boshqarish

### Settings (Sozlamalar)
- `manage_settings` - Tizim sozlamalarini boshqarish

### Couriers (Kurierlar)
- `manage_couriers` - Kurierlarni boshqarish

## Error Responses

### Validation Error (400)
```json
{
    "success": false,
    "message": "Validation error message"
}
```

### Unauthorized (401)
```json
{
    "success": false,
    "message": "Email yoki parol noto'g'ri"
}
```

### Forbidden (403)
```json
{
    "success": false,
    "message": "Sizning akkauntingiz bloklangan"
}
```

### Not Found (404)
```json
{
    "success": false,
    "message": "Admin topilmadi"
}
```

### Server Error (500)
```json
{
    "success": false,
    "message": "Serverda xatolik yuz berdi"
}
```

## Validatsiya Qoidalari

### Admin
- `firstName` - 2-50 ta belgi
- `lastName` - 2-50 ta belgi
- `email` - To'g'ri email formati
- `password` - Kamida 6 ta belgi
- `role` - `admin` yoki `superadmin`
- `status` - `active`, `inactive` yoki `blocked`
- `permissions` - Yuqorida ko'rsatilgan ruxsatlar ro'yxatidan

## Admin Roles
- `superadmin` - Barcha huquqlarga ega
- `admin` - Cheklangan huquqlarga ega

## Admin Status
- `active` - Faol
- `inactive` - Faol emas
- `blocked` - Bloklangan
