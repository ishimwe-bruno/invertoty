# Backend API Implementation Checklist

This checklist outlines all the API endpoints that need to be created or updated in the backend to support the new frontend features.

## ? Required API Endpoints

### History Endpoints (New)

#### 1. GET `/api/history`
**Purpose**: Fetch all stock movement history  
**Access**: Admin only  
**Returns**: Array of history objects

**Expected Response Format**:
```json
[
  {
    "id": 1,
    "productName": "Product A",
    "product": {
      "id": 1,
      "name": "Product A"
    },
    "action": "Added", // or "Removed", "Updated"
    "quantity": 50,
    "userName": "John Doe",
    "user": {
      "id": 1,
      "name": "John Doe"
    },
    "date": "2024-04-22T10:30:00Z"
  }
]
```

#### 2. GET `/api/history/:id`
**Purpose**: Fetch specific history entry  
**Access**: Admin only  
**Returns**: Single history object

#### 3. GET `/api/history/download`
**Purpose**: Download stock history as Excel file  
**Access**: Admin only  
**Returns**: Binary Excel file (.xlsx)

**Important Notes**:
- Must return proper Excel file format
- File name should be: `stock-history-YYYY-MM-DD.xlsx`
- Include columns: Product Name, Action, Quantity, User, Date

### Notification Endpoints (New)

#### 1. GET `/api/notifications`
**Purpose**: Fetch all unread notifications for current user  
**Access**: Authenticated users  
**Returns**: Array of notification objects

**Expected Response Format**:
```json
[
  {
    "id": 1,
    "message": "Low stock alert: Product A has quantity below threshold",
    "createdAt": "2024-04-22T10:30:00Z",
    "read": false,
    "userId": 1
  }
]
```

#### 2. PUT `/api/notifications/:id/read`
**Purpose**: Mark a notification as read  
**Access**: Authenticated users  
**Returns**: Updated notification object

#### 3. DELETE `/api/notifications/:id`
**Purpose**: Delete a notification  
**Access**: Authenticated users  
**Returns**: Success message

## ?? Database Schema Suggestions

### History Table
```sql
CREATE TABLE stock_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'Added', 'Removed', 'Updated'
  quantity INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_history_date ON stock_history(created_at);
CREATE INDEX idx_history_product ON stock_history(product_id);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
```

## ?? Trigger/Event Suggestions

### Auto-create history on product operations

**When adding a product**:
```sql
INSERT INTO stock_history (product_id, action, quantity, user_id) 
VALUES (NEW.id, 'Added', NEW.quantity, current_user_id);
```

**When removing a product**:
```sql
INSERT INTO stock_history (product_id, action, quantity, user_id) 
VALUES (deleted_id, 'Removed', deleted_quantity, current_user_id);
```

**When updating product quantity**:
```sql
INSERT INTO stock_history (product_id, action, quantity, user_id) 
VALUES (updated_id, 'Updated', quantity_difference, current_user_id);
```

## ?? Implementation Order

1. **Database Setup**
   - Create history table with indexes
   - Create notifications table with indexes
   - Add foreign keys

2. **Middleware**
   - Create admin-only middleware for history routes
   - Update auth middleware if needed

3. **History Endpoints**
   - Implement GET /api/history (with pagination for large datasets)
   - Implement GET /api/history/:id
   - Implement GET /api/history/download (with Excel library like xlsx, exceljs, or similar)

4. **Notification Endpoints**
   - Implement GET /api/notifications
   - Implement PUT /api/notifications/:id/read
   - Implement DELETE /api/notifications/:id

5. **Triggers/Events**
   - Add logic to create history records when products are added/removed/updated
   - Add logic to create notifications for low stock alerts

6. **Testing**
   - Test all endpoints with admin user
   - Test Excel download functionality
   - Test notification system
   - Verify pagination on history endpoint (if implemented)

## ??? Recommended Libraries

### For Excel Export:
- **exceljs** - Full-featured Excel library
- **xlsx** - Lightweight spreadsheet library
- **excel4node** - NodeJS Excel generator

### Example with exceljs:
```javascript
const ExcelJS = require('exceljs');

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Stock History');

// Add headers
worksheet.columns = [
  { header: 'Product Name', key: 'productName', width: 20 },
  { header: 'Action', key: 'action', width: 15 },
  { header: 'Quantity', key: 'quantity', width: 10 },
  { header: 'User', key: 'userName', width: 20 },
  { header: 'Date', key: 'date', width: 20 }
];

// Add data
history.forEach(entry => {
  worksheet.addRow(entry);
});

// Generate file
await workbook.xlsx.writeFile('stock-history.xlsx');
```

## ?? Security Considerations

1. **Authentication**: All endpoints must verify user is authenticated
2. **Authorization**: History and sensitive endpoints require admin role
3. **Rate Limiting**: Consider rate limiting for download endpoint
4. **Pagination**: History endpoint should support pagination to prevent data dumping
5. **Audit Trail**: Keep detailed logs of who downloads history files

## ? Future Enhancements

1. **Filtering**: Add date range filters to history endpoint
2. **Sorting**: Allow sorting by date, product, action
3. **Search**: Enable searching by product name or user
4. **Notifications**: Add notification preferences/settings
5. **Webhooks**: Send notifications via email or SMS
6. **Analytics**: Generate statistics from history data

---

**Status**: Implementation Required  
**Priority**: High  
**Estimated Time**: 4-6 hours  
**Difficulty**: Medium
