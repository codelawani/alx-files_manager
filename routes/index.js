import { AppController } from '../controllers/AppController';

const { Router } = require('express');

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

export default router;
