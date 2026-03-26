import { Router } from 'express';
import { uploadXRay } from '../controllers/xray.controller';
import { upload } from '../utils/upload';

const router = Router();

router.post('/upload', upload.single('file'), uploadXRay);

export default router;
