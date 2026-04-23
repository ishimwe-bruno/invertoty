import { Router } from 'express';
import {
  getHistory,
  getHistoryPreview,
  exportHistoryToExcel,
  getHistoryStats,
} from '../controller/historyController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All history routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Get paginated history
router.get('/', getHistory);

// Get preview of history (before export)
router.get('/preview', getHistoryPreview);

// Get history statistics
router.get('/stats', getHistoryStats);

// Export history to Excel
router.get('/export', exportHistoryToExcel);

export default router;
