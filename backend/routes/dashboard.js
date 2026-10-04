import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard
router.get('/', authMiddleware, getDashboardStats);

export default router;