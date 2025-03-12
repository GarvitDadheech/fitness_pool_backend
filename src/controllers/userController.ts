import { Response } from 'express';
import { z } from 'zod';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { AuthRequest } from '../middlewares/authMiddleware';

// Zod schema for profile update
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  age: z.number().min(13).max(120).optional(),
  dob: z.string().datetime().optional(),
  bio: z.string().max(500).optional()
});

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await getUserProfile(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json({ user });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Validate request body
    const validationResult = updateProfileSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      });
    }
    
    const updatedUser = await updateUserProfile(req.user.id, validationResult.data);
    
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}; 