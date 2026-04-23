import { Router } from 'express';
import { getAll, getOne, create, update, remove, lowStock } from '../controller/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All admin product routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Admin-only product management
router.post('/',         create);    // Add Product - Admin only
router.put('/:id',       update);    // Update Product - Admin only
router.delete('/:id',    remove);    // Delete Product - Admin only

export default router;