import { Response } from 'express';
import User from '../Models/UserModal';
import { redis } from '../config/redis';

export const getUserDetails = async (userId: string, res: Response) => {
    const user = await User.findById(userId).select('-__v');
    if (!user) {
        throw new Error('User not found');
    }
    res.status(200).json({
        success: true,
        user,
    });
};

export const updateUserDetails = async (userId: string, updateData: any) => {
    // udate redis user by userId
    redis.set(userId, JSON.stringify(updateData));
};
