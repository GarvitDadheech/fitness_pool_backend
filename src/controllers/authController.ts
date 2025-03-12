import { Request, Response } from 'express';
import { z } from 'zod';
import { verifyWalletAndGetUser } from '../services/authService';
import { generateNonce } from '../utils/solanaUtils';

// Zod schema for wallet login
const walletLoginSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  message: z.string(),
  signature: z.string()
});

// Store nonces (in a real app, use Redis or another persistent store)
const nonceStore: Record<string, { nonce: string, timestamp: number }> = {};

export const getNonce = (req: Request, res: Response) => {
  const walletAddress = req.query.walletAddress as string;
  
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }
  
  const nonce = generateNonce();
  
  // Store nonce with expiration (5 minutes)
  nonceStore[walletAddress] = {
    nonce,
    timestamp: Date.now() + 5 * 60 * 1000
  };
  
  return res.status(200).json({ 
    nonce,
    message: `Sign this message to authenticate: ${nonce}`
  });
};

export const walletLogin = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = walletLoginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      });
    }
    
    const { walletAddress, message, signature } = validationResult.data;
    
    // Verify nonce
    const storedNonce = nonceStore[walletAddress];
    if (!storedNonce || Date.now() > storedNonce.timestamp) {
      return res.status(401).json({ error: 'Nonce expired or invalid' });
    }
    
    // Clear nonce after use
    delete nonceStore[walletAddress];
    
    // Verify wallet signature and get user
    const { user, token } = await verifyWalletAndGetUser(
      walletAddress,
      message,
      signature
    );
    
    return res.status(200).json({
      message: 'Authentication successful',
      user,
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(401).json({ error: error.message || 'Authentication failed' });
  }
}; 