import { Router } from 'express';
import { getBases, getBaseById, createBase, updateBase, deleteBase } from '../controllers/baseController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';

const router = Router();

// Protect all base routes with authentication
router.use(authenticateToken);

// Logistics Officers and Base Commanders might need to view bases
router.get('/', getBases);
router.get('/:id', getBaseById);

// Only Admins can manage bases
router.post('/', authorizeRoles('Admin'), createBase);
router.put('/:id', authorizeRoles('Admin'), updateBase);
router.delete('/:id', authorizeRoles('Admin'), deleteBase);

export default router;
