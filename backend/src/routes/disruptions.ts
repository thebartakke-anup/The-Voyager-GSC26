import { Router } from 'express';
import {
  getDisruptions, getDisruptionById, createDisruption, updateDisruptionStatus
} from '../controllers/disruptionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getDisruptions);
router.get('/:id', authenticate, getDisruptionById);
router.post('/', authenticate, createDisruption);
router.put('/:id/status', authenticate, updateDisruptionStatus);

export default router;
