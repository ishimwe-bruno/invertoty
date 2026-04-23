import { Router } from 'express';
import { getDashboard, getProfile } from '../controller/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Get dashboard data (role-based)
router.get('/', getDashboard);

// Get user profile
router.get('/profile', getProfile);

export default router;