import express from 'express';
import * as userController from '../../controllers/userController';
import { authenticate } from '../../middleware/authenticate';

const router = express.Router();

router.use(authenticate); 

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

export default router;