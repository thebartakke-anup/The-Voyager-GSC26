import { Router } from 'express';
import {
  getTimeline, advanceSimulation, resetSimulation, getCurrentState
} from '../controllers/simulationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:shipmentId/timeline', authenticate, getTimeline);
router.post('/:shipmentId/advance', authenticate, advanceSimulation);
router.post('/:shipmentId/reset', authenticate, resetSimulation);
router.get('/:shipmentId/current-state', authenticate, getCurrentState);

export default router;
