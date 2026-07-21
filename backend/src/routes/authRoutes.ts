import { Router } from 'express';
import { login, getAuditLogs } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';

const router = Router();

router.post('/login', login);
router.get('/audit-logs', authenticateToken, authorizeRoles('Admin'), getAuditLogs);

export default router;
