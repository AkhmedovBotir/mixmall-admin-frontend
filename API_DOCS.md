# MixMall Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Ko'p API endpointlar autentifikatsiyani talab qiladi. Token `Authorization` headerida `Bearer` sxemasi bilan yuborilishi kerak:

```
Authorization: Bearer <access_token>
```

## Authentication APIs

### Register
```http
POST /auth/register
```

Yangi foydalanuvchi ro'yxatdan o'tkazish.

**Request Body:**
```json
{
  "fullName": "string",
  "phone": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ro'yxatdan o'tish muvaffaqiyatli",
  "data": {
    "token": "string",
    "user": {
      "_id": "string",
      "fullName": "string",
      "phone": "string",
      "role": "string"
    }
  }
}
```

### Login
```http
POST /auth/login
```

Tizimga kirish.

**Request Body:**
```json
{
  "phone": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tizimga muvaffaqiyatli kirdingiz",
  "data": {
    "token": "string",
    "user": {
      "_id": "string",
      "fullName": "string",
      "phone": "string",
      "role": "string"
    }
  }
}
```

## Products APIs

### Get All Products
```http
GET /products
```

Barcha mahsulotlarni olish.

**Query Parameters:**
- `page` (optional): Sahifa raqami (default: 1)
- `limit` (optional): Har bir sahifadagi mahsulotlar soni (default: 10)
- `category` (optional): Kategoriya ID si
- `brand` (optional): Brand ID si
- `search` (optional): Qidiruv so'zi
- `sort` (optional): Saralash turi (price_asc, price_desc, newest, popular)
- `minPrice` (optional): Minimal narx
- `maxPrice` (optional): Maksimal narx

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "string",
        "name": "string",
        "description": "string",
        "price": "number",
        "discount_price": "number",
        "discount_percent": "number",
        "images": ["string"],
        "category": {
          "_id": "string",
          "name": "string"
        },
        "brand": {
          "_id": "string",
          "name": "string"
        },
        "stock": "number",
        "specifications": [
          {
            "name": "string",
            "value": "string"
          }
        ],
        "averageRating": "number",
        "totalRatings": "number"
      }
    ],
    "total": "number",
    "page": "number",
    "pages": "number"
  }
}
```

### Get Product by ID
```http
GET /products/:id
```

Mahsulot ma'lumotlarini ID bo'yicha olish.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "discount_price": "number",
    "discount_percent": "number",
    "images": ["string"],
    "category": {
      "_id": "string",
      "name": "string"
    },
    "brand": {
      "_id": "string",
      "name": "string"
    },
    "stock": "number",
    "specifications": [
      {
        "name": "string",
        "value": "string"
      }
    ],
    "ratings": [
      {
        "user": "string",
        "rating": "number",
        "comment": "string",
        "createdAt": "date"
      }
    ],
    "averageRating": "number",
    "totalRatings": "number"
  }
}
```

## Cart APIs

### Get Cart
```http
GET /cart
```

Foydalanuvchi savatini olish.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "product": {
          "_id": "string",
          "name": "string",
          "price": "number",
          "discount_price": "number",
          "images": ["string"]
        },
        "quantity": "number",
        "totalPrice": "number"
      }
    ],
    "totalItems": "number",
    "totalPrice": "number"
  }
}
```

### Add to Cart
```http
POST /cart
```

Savatga mahsulot qo'shish.

**Request Body:**
```json
{
  "productId": "string",
  "quantity": "number"
}
```

### Update Cart Item
```http
PUT /cart/:productId
```

Savatdagi mahsulot miqdorini yangilash.

**Request Body:**
```json
{
  "quantity": "number"
}
```

### Remove from Cart
```http
DELETE /cart/:productId
```

Savatdan mahsulotni o'chirish.

## Orders APIs

### Create Order
```http
POST /orders
```

Yangi buyurtma yaratish.

**Request Body:**
```json
{
  "address": {
    "_id": "string"
  },
  "paymentType": "string" // cash, card
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "user": "string",
    "items": [
      {
        "product": {
          "_id": "string",
          "name": "string",
          "price": "number"
        },
        "quantity": "number",
        "totalPrice": "number"
      }
    ],
    "totalPrice": "number",
    "status": "string",
    "address": {
      "region": "string",
      "district": "string",
      "street": "string",
      "house": "string",
      "apartment": "string",
      "landmark": "string"
    },
    "paymentType": "string",
    "paymentStatus": "string",
    "createdAt": "date"
  }
}
```

### Get Orders
```http
GET /orders
```

Foydalanuvchi buyurtmalarini olish.

**Query Parameters:**
- `page` (optional): Sahifa raqami (default: 1)
- `limit` (optional): Har bir sahifadagi buyurtmalar soni (default: 10)
- `status` (optional): Buyurtma holati (pending, processing, shipped, delivered, cancelled)

### Rate Product
```http
POST /orders/:orderId/rate/:productId
```

Yetkazib berilgan mahsulotga baho qo'yish.

**Request Body:**
```json
{
  "rating": "number", // 1-5
  "comment": "string"
}
```

## Address APIs

### Get Addresses
```http
GET /address
```

Foydalanuvchi manzillarini olish.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "region": "string",
      "district": "string",
      "street": "string",
      "house": "string",
      "apartment": "string",
      "landmark": "string",
      "isDefault": "boolean"
    }
  ]
}
```

### Add Address
```http
POST /address
```

Yangi manzil qo'shish.

**Request Body:**
```json
{
  "region": "string",
  "district": "string",
  "street": "string",
  "house": "string",
  "apartment": "string",
  "landmark": "string",
  "isDefault": "boolean"
}
```

## Categories APIs

### Get Categories
```http
GET /categories
```

Barcha kategoriyalarni olish.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "image": "string",
      "parent": "string",
      "children": [
        {
          "_id": "string",
          "name": "string",
          "image": "string"
        }
      ]
    }
  ]
}
```

## Brands APIs

### Get Brands
```http
GET /brands
```

Barcha brandlarni olish.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "image": "string"
    }
  ]
}
```

## Profile APIs

### Get Profile
```http
GET /profile
```

Foydalanuvchi profilini olish.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "fullName": "string",
    "phone": "string",
    "role": "string"
  }
}
```

### Update Profile
```http
PUT /profile
```

Profil ma'lumotlarini yangilash.

**Request Body:**
```json
{
  "fullName": "string",
  "currentPassword": "string",
  "newPassword": "string"
}
```

## Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Avtorizatsiyadan o'tilmagan"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Ruxsat berilmagan"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Ma'lumot topilmadi"
}
```

**422 Validation Error:**
```json
{
  "success": false,
  "message": "Validatsiya xatosi",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Server xatosi"
}