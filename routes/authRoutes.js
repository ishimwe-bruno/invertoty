import { Router } from 'express';
import { register, registerAdmin, login, getAllUsers, getUserById, updateUser, deleteUser } from '../controller/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/register',        register);                                // Staff self-register (public)
router.post('/login',           login);                                   // Login for all roles (public)
router.post('/admin/register',  authenticate, authorize('admin'), registerAdmin); // Admin only creates admin
router.get('/users',            authenticate, authorize('admin'), getAllUsers);    // Admin only - view all users
router.get('/users/:id',        authenticate, authorize('admin'), getUserById);    // Admin only - view specific user
router.put('/users/:id',        authenticate, authorize('admin'), updateUser);     // Admin only - update user
router.delete('/users/:id',     authenticate, authorize('admin'), deleteUser);     // Admin only - delete user

export default router;
