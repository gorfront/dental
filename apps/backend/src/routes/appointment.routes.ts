import { Router } from 'express';
import { getSlots, createAppointment, getAppointments } from '../controllers/appointment.controller';

const router = Router();

router.get('/slots', getSlots);
router.post('/', createAppointment);
router.get('/', getAppointments);

export default router;
