import { Response } from 'express';
import User from '../Models/UserModal';

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
