import { AppController } from '../controllers/AppController';
import { UsersController } from '../controllers/UsersController';

const { Router } = require('express');

const router = Router();

// main
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// users
router.post('/users', UsersController.postNew);

export default router;
