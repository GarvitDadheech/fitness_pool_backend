import { Router } from 'express';
import { getNonce, verifyNonce, createProfile } from '../controllers/authController';

const router = Router();

router.get('/nonce', getNonce);
router.post('/verify-nonce', verifyNonce);
router.post('/profile', createProfile);

export { router as authRouter }; 