import { Router } from 'express';
import { getAll, getOne, lowStock } from '../controller/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All staff product routes require authentication and staff/admin role
router.use(authenticate);

// Public read operations for authenticated users (staff, admin, customer)
router.get('/',          getAll);
// Staff-specific operations (staff and admin can access)
router.get('/low-stock', authorize('staff', 'admin'), lowStock); // Low Stock Alert - Staff & Admin
router.get('/:id',       getOne);

export default router;
