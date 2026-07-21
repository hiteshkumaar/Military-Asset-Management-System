import { Router } from 'express';
import { createAssignment, getAssignments } from '../controllers/assignmentController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authenticateToken);

router.get('/', getAssignments);
router.post('/', authorizeRoles('Admin', 'Logistics Officer'), createAssignment);

export default router;
