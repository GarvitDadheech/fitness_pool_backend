import prisma from '../models/prisma';
import { verifySignature } from '../utils/solanaUtils';
import { generateToken } from '../utils/jwt';

export const verifyWalletAndGetUser = async (
  walletAddress: string,
  message: string,
  signature: string
): Promise<{ user: any; token: string }> => {
  // Verify the signature
  const isValid = verifySignature(message, signature, walletAddress);
  
  if (!isValid) {
    throw new Error('Invalid signature');
  }
  
  // Find or create user
  let user = await prisma.user.findUnique({
    where: { walletAddress }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: { walletAddress }
    });
  }
  
  // Generate JWT token
  const token = generateToken(user.id, user.walletAddress);
  
  return { user, token };
}; 