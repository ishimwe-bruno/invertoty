import { Router } from 'express';
import { getAll, getOne, create, update, remove, lowStock } from '../controller/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes for customers
router.get('/',          getAll);
router.get('/:id',       getOne);

// Protected routes
router.use(authenticate);

router.get('/low-stock', lowStock);                      // Low Stock Alert - Staff & Admin
router.post('/',         authorize('admin'), create);    // Add Product - Admin only
router.put('/:id',       authorize('admin'), update);    // Update Stock - Admin only
router.delete('/:id',    authorize('admin'), remove);    // Delete Product - Admin only

export default router;
