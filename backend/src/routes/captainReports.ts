import { Router } from 'express';
import {
  getCaptainReports, createCaptainReport, getCaptainReportById
} from '../controllers/captainReportController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getCaptainReports);
router.post('/', authenticate, requireRole('CAPTAIN', 'ADMIN'), createCaptainReport);
router.get('/:id', authenticate, getCaptainReportById);

export default router;
