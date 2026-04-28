import { Router } from 'express';
import { getPorts } from '../controllers/portController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getPorts);

export default router;
