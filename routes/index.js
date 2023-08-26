import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import { respond, getUserFromToken } from '../utils/helpers';

const { Router } = require('express');

const router = Router();

// main
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// users
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

// Auth
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// User validator
router.use(async (req, res, next) => {
  const token = req.headers['x-token'];
  const { userId } = await getUserFromToken(token);
  req.customData = { userId };
  if (!userId) {
    respond(res, 'Unauthorized');
  } else next();
});

// Files
router.post('/files', FilesController.postUpload);

router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);

router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);

export default router;
