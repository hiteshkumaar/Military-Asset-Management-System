import { Router } from 'express';
import { createPurchase, getPurchases } from '../controllers/purchaseController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authenticateToken);

router.get('/', getPurchases);
router.post('/', authorizeRoles('Admin', 'Logistics Officer'), createPurchase);

export default router;
