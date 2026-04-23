# Product History & Audit Features

This document describes the new product history and audit tracking features added to the Invertory system.

## Overview

The history system automatically tracks all changes to products in your inventory, including:
- **Product Creation**: When a new product is added
- **Quantity Updates**: When stock levels change
- **Product Modifications**: When product details are updated
- **Product Deletion**: When products are removed from inventory

All operations are logged with timestamps and associated with the admin user who made the change.

## Features

### 1. **Automatic History Logging**
Every product operation (create, update, delete) is automatically logged with:
- Action type (create, update, delete)
- Previous and new quantity
- Product details (name, SKU, price)
- Date and time of the action
- Admin user who performed the action
- Additional field changes

### 2. **History Preview**
Before exporting, admins can preview the complete history data including:
- All tracked changes
- Summary statistics
- Pagination support

### 3. **Excel Export**
Export complete stock history as an Excel (.xlsx) file containing:
- Date of each action
- Action type
- Product name and SKU
- Price information
- Quantity changes
- Admin user details
- Formatted columns for easy reading

### 4. **History Statistics**
View quick statistics including:
- Total number of actions
- Breakdown by action type (create, update, delete)
- Recent actions with details

## API Endpoints

All history endpoints require admin authentication with valid JWT token.

### Get Product History (Paginated)
```
GET /api/history?page=1&limit=50&productId=1
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Records per page (default: 50)
- `productId` (optional): Filter by specific product ID

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "action": "create",
      "productName": "Laptop",
      "productSku": "SKU001",
      "previousQuantity": null,
      "newQuantity": 10,
      "createdAt": "2025-04-22T10:30:00.000Z",
      "user": {
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "pages": 3
  }
}
```

### Get History Preview (Before Export)
```
GET /api/history/preview?format=detailed&productId=1
```

**Query Parameters:**
- `format` (optional): 'detailed' (default) or 'summary' (returns first 20 records)
- `productId` (optional): Filter by specific product ID

**Response:**
```json
{
  "totalRecords": 45,
  "preview": [
    {
      "id": 1,
      "date": "2025-04-22T10:30:00.000Z",
      "action": "create",
      "product": "Laptop",
      "sku": "SKU001",
      "price": "1200.00",
      "previousQuantity": null,
      "newQuantity": 10,
      "user": "Admin User",
      "email": "admin@example.com"
    }
  ]
}
```

### Get History Statistics
```
GET /api/history/stats
```

**Response:**
```json
{
  "totalActions": 250,
  "actionBreakdown": [
    { "action": "update", "count": 150 },
    { "action": "create", "count": 50 },
    { "action": "delete", "count": 50 }
  ],
  "recentActions": [...]
}
```

### Export History to Excel
```
GET /api/history/export?productId=1
```

**Query Parameters:**
- `productId` (optional): Export history for specific product only

**Response:**
- Returns binary Excel file for download
- Filename: `product_history.xlsx`
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

## Usage Examples

### Example 1: Check History for a Specific Product

```bash
# Get preview of changes for product ID 5
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/history/preview?productId=5"
```

### Example 2: Export Complete History to Excel

```bash
# Download complete history as Excel file
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/history/export" \
  -o product_history.xlsx
```

### Example 3: Get Paginated History

```bash
# Get first 50 records of history
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/history?page=1&limit=50"
```

### Example 4: View Statistics

```bash
# Get history statistics
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/history/stats"
```

## Database Schema

### ProductHistory Table

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| productId | INT | Foreign key to Products table |
| userId | INT | Foreign key to Users table (admin who made the change) |
| action | ENUM | 'create', 'update', or 'delete' |
| previousQuantity | INT | Stock level before change |
| newQuantity | INT | Stock level after change |
| productName | VARCHAR | Product name at time of action |
| productSku | VARCHAR | Product SKU at time of action |
| productPrice | DECIMAL | Product price at time of action |
| description | TEXT | Product description |
| changeDetails | JSON | Object with other field changes |
| createdAt | TIMESTAMP | Date and time of the action |

## Security & Access Control

- **Admin Only**: Only users with 'admin' role can access history endpoints
- **JWT Authentication**: Valid JWT token required for all requests
- **Automatic Logging**: User identity automatically captured from JWT token
- **Read-Only**: History data cannot be modified (no delete/update endpoints)

## Excel Export Format

The Excel file includes the following columns:
1. **Date** - Formatted date and time of action
2. **Action** - Type of action (CREATE, UPDATE, DELETE)
3. **Product Name** - Name of the product
4. **SKU** - Product SKU
5. **Price** - Product price
6. **Previous Quantity** - Stock level before change
7. **New Quantity** - Stock level after change
8. **Quantity Change** - Calculated difference
9. **User** - Admin user who made the change
10. **Email** - Admin user email
11. **Description** - Product description
12. **Additional Changes** - JSON details of other field modifications

## Notes

- All timestamps are in UTC/ISO format
- History is immutable - once logged, it cannot be deleted or modified
- The system automatically logs all product operations even if an error occurs
- When products are deleted, the deletion is tracked in history before the product is removed
- Excel files are generated on-the-fly with current data at time of export

## Requirements

- Node.js v14+
- Express.js v5+
- Sequelize v6+
- MySQL v5.7+ or v8+
- XLSX library (already installed)
- Valid admin user account
