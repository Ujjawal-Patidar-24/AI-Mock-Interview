import express from 'express';
import { getAIResponse } from '../controllers/aiController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/ask', authMiddleware, getAIResponse);

export default router;