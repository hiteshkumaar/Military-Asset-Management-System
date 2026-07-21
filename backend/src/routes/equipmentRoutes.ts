import { Router } from 'express';
import { getEquipment, getEquipmentById, createEquipment, updateEquipment, deleteEquipment } from '../controllers/equipmentController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getEquipment);
router.get('/:id', getEquipmentById);

router.post('/', authorizeRoles('Admin'), createEquipment);
router.put('/:id', authorizeRoles('Admin'), updateEquipment);
router.delete('/:id', authorizeRoles('Admin'), deleteEquipment);

export default router;
