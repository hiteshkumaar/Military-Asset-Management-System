import { Router } from 'express';
import { createExpenditure, getExpenditures } from '../controllers/expenditureController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authenticateToken);

router.get('/', getExpenditures);
router.post('/', authorizeRoles('Admin', 'Logistics Officer'), createExpenditure);

export default router;
