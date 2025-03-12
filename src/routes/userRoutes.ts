import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export { router as userRouter }; 