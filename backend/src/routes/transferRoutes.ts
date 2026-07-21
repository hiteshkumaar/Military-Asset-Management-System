import { Router } from 'express';
import { createTransfer, getTransfers } from '../controllers/transferController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authenticateToken);

router.get('/', getTransfers);
router.post('/', authorizeRoles('Admin', 'Logistics Officer'), createTransfer);

export default router;
