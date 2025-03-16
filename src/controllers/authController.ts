import { Request, Response } from 'express';
import { z } from 'zod';
import { verifySignature, generateNonce } from '../utils/solanaUtils';
import prisma from '../models/prisma';
import { generateToken } from '../utils/jwt';

// Store nonces (in a real app, use Redis or another persistent store)
const nonceStore: Record<string, { nonce: string, timestamp: number }> = {};

// Zod schema for wallet verification
const verifyNonceSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  message: z.string(),
  signature: z.string()
});

// Zod schema for profile creation
const createProfileSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  name: z.string().min(1).max(100),
  gender: z.enum(['male', 'female', 'other']),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), 
  bio: z.string().max(500).optional()
});

/**
 * Get a nonce for wallet verification
 */
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
  console.log(nonce);
  return res.status(200).json({ 
    nonce,
    message: `Sign this message to authenticate: ${nonce}`
  });
};

/**
 * Verify a signed nonce
 */
export const verifyNonce = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = verifyNonceSchema.safeParse(req.body);
    
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
    
    // Verify signature
    const isValid = verifySignature(message, signature, walletAddress);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    console.log(isValid);
    return res.status(200).json({
      message: 'Wallet verified successfully',
      isValid: true
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return res.status(401).json({ error: error.message || 'Verification failed' });
  }
};

/**
 * Create or update user profile
 */
export const createProfile = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = createProfileSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      });
    }
    
    const { walletAddress, name, gender, dob, bio } = validationResult.data;
    
    // Create or update user
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: { 
        name, 
        gender, 
        dob: new Date(dob), 
        bio 
      },
      create: { 
        walletAddress, 
        name, 
        gender, 
        dob: new Date(dob), 
        bio 
      }
    });
    
    // Generate JWT token
    const token = generateToken(user.id, user.walletAddress);
    
    return res.status(200).json({
      message: 'Profile created successfully',
      user,
      token
    });
  } catch (error: any) {
    console.error('Profile creation error:', error);
    return res.status(500).json({ error: error.message || 'Profile creation failed' });
  }
}; 