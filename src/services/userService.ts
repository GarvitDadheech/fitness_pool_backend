import prisma from '../models/prisma';

export const getUserProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId }
  });
};

export const updateUserProfile = async (userId: string, data: any) => {
  return prisma.user.update({
    where: { id: userId },
    data
  });
}; 