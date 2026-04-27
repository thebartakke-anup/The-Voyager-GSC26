import { Router } from 'express';
import { getShipments, getShipmentById, updateShipmentStatus } from '../controllers/shipmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getShipments);
router.get('/:id', authenticate, getShipmentById);
router.put('/:id/status', authenticate, updateShipmentStatus);

export default router;
