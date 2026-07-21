import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/dashboardController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticateToken);

router.get('/', getDashboardAnalytics);

export default router;
