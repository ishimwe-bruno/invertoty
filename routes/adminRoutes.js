import { Router } from 'express';
import {
  registerAdmin,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controller/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Admin-only user management
router.post('/register-admin', registerAdmin);  // Create another admin
router.get('/users',           getAllUsers);     // Get all users
router.get('/users/:id',       getUserById);     // Get user by ID
router.put('/users/:id',       updateUser);      // Update user
router.delete('/users/:id',    deleteUser);      // Delete user

export default router;