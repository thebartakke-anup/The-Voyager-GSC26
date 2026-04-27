import { Router } from 'express';
import {
  getRecommendations, getRecommendationById, approveRecommendation, rejectRecommendation
} from '../controllers/recommendationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getRecommendations);
router.get('/:id', authenticate, getRecommendationById);
router.put('/:id/approve', authenticate, approveRecommendation);
router.put('/:id/reject', authenticate, rejectRecommendation);

export default router;
