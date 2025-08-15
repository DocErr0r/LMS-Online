import { NextFunction, Response } from 'express';
import User from '../Models/UserModal';
import { redis } from '../config/redis';
import ErrorHandler from '../Utils/ErrorHnadler';

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

// get all users
export const getAllUsers = async (res: Response, next: NextFunction) => {
    const users = await User.find().sort({ createdAt: -1 });
    if (!users || users.length === 0) {
        return next(new ErrorHandler('No users found', 404));
    }
    res.status(200).json({
        success: true,
        users,
    });
    // return users;
};

// update user role -- admin only
export const updateRoleService = async (adminRole: string, userId: string, role: string, res: Response, next: NextFunction) => {
    try {
        // admin user not change by other admin without permission
        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }
        if (user.role === 'admin' && adminRole !== 'superAdmin') {
            return next(new ErrorHandler('You cannot change admin role', 403));
        }
        const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true });
        redis.set(user._id as string, JSON.stringify(user));
        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            user: updatedUser,
        });
    } catch (error: any) {
        next(new ErrorHandler(error, 400));
    }
};
