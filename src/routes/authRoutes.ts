import { Router } from 'express';
import { getNonce, walletLogin } from '../controllers/authController';

const router = Router();

router.get('/nonce', getNonce);
router.post('/wallet-login', walletLogin);

export { router as authRouter }; 