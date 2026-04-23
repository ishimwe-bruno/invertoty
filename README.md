# Invertory - Inventory Management System

A complete inventory management API built with Node.js, Express, Sequelize, and MySQL.

## 🚀 Features

- **User Authentication**: Register staff, admin login with JWT
- **Role-Based Access Control**: Admin and Staff roles with different permissions
- **Product Management**: Create, read, update, delete products
- **Stock Tracking**: Monitor inventory levels and low-stock alerts
- **Secure API**: Protected routes with JWT authentication

## 📋 Prerequisites

- Node.js (v16+)
- MySQL Server (running locally or remotely)
- npm or yarn

## 🔧 Setup & Installation

### 1. Install Dependencies

\\\ash
npm install
\\\

### 2. Configure Database

Edit the \.env\ file with your database credentials:

\\\env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=invertory
PORT=3000
JWT_SECRET=invertory_super_secret_key_2025
\\\

### 3. Initialize Database

Run the setup script to create tables and seed sample data:

\\\ash
node scripts/db_sync.js
\\\

This will:
- Connect to your MySQL database
- Create User and Product tables
- Seed sample users and products

## 📦 Sample Data

After setup, you'll have:

**Users:**
- Admin: \dmin@invertory.com\ / \dmin123\
- Staff 1: \staff1@invertory.com\ / \staff123\
- Staff 2: \staff2@invertory.com\ / \staff123\

**Products:**
- Laptop, Wireless Mouse, USB-C Cable, Mechanical Keyboard, USB Hub, Monitor

## 🏃 Running the Server

**Development Mode** (with auto-reload):
\\\ash
npm run dev
\\\

**Production Mode:**
\\\ash
npm start
\\\

Server runs on \http://localhost:3000\

## 📚 API Endpoints

### Authentication

- \POST /api/auth/register\ - Register as staff (public)
- \POST /api/auth/login\ - Login (public)
- \POST /api/auth/admin/register\ - Create admin account (admin only)

### Products

- \GET /api/products\ - Get all products (authenticated)
- \GET /api/products/:id\ - Get single product (authenticated)
- \GET /api/products/low-stock\ - Get low-stock items (authenticated)
- \POST /api/products\ - Create product (admin only)
- \PUT /api/products/:id\ - Update product (admin only)
- \DELETE /api/products/:id\ - Delete product (admin only)

## 🔐 Authentication

All product endpoints require a JWT token in the Authorization header:

\\\ash
Authorization: Bearer <your_jwt_token>
\\\

## 📁 Project Structure

\\\
invertory/
├── config/               # Database configuration
├── controller/          # Request handlers
├── database/
│   ├── models/         # Sequelize models
│   ├── migrations/     # Database schema migrations
│   └── seeds/          # Sample data seeds
├── middleware/         # Authentication & authorization
├── routes/            # API routes
├── scripts/           # Utility scripts (db_sync.js)
├── utils/             # Helper utilities
├── .env              # Environment variables
├── index.js          # Main server file
└── package.json
\\\

## 🧪 Testing with cURL

### Login
\\\ash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{\"email\":\"admin@invertory.com\",\"password\":\"admin123\"}'
\\\

### Get Products
\\\ash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer <your_token>"
\\\

### Get Low Stock Items
\\\ash
curl -X GET http://localhost:3000/api/products/low-stock \
  -H "Authorization: Bearer <your_token>"
\\\

## 🐛 Troubleshooting

**Database connection error:**
- Ensure MySQL is running
- Check .env credentials
- Verify database name exists or will be created

**Port already in use:**
- Change PORT in .env
- Or kill process using port 3000

**JWT errors:**
- Make sure to include the Authorization header
- Check token format: \Bearer <token>\

## 📄 License

ISC
