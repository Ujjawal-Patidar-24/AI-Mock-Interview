import express from 'express';
import { saveInterview, getInterviews, getInterviewById } from '../controllers/interviewController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/interview/save
router.post('/save', authMiddleware, saveInterview);

// GET /api/interview/all
router.get('/all', authMiddleware, getInterviews);

// GET /api/interview/:id
router.get('/:id', authMiddleware, getInterviewById);

export default router;