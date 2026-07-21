import { Router } from 'express';
import { getInventory } from '../controllers/inventoryController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', getInventory);

export default router;
