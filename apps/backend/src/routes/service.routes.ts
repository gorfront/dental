import { Router } from 'express';
import {
    getAllServices,
    createService,
    updateService,
    deleteService
} from '../controllers/service.controller';
import { verifyToken, requireRoles } from '../utils/auth.middleware';

const router = Router();

router.get('/', getAllServices);

router.post('/', verifyToken, requireRoles(['ADMIN']), createService);

router.put('/:id', verifyToken, requireRoles(['ADMIN']), updateService);

router.delete('/:id', verifyToken, requireRoles(['ADMIN']), deleteService);

export default router;