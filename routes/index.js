import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

const { Router } = require('express');

const router = Router();

// main
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// users
router.post('/users', UsersController.postNew);

// AUth
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

export default router;
