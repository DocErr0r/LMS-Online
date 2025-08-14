import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import Notification from '../Models/Notification.model';

// get all notification to admin
export const getNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        next(new ErrorHandler(error, 500));
    }
});

// update status of notification --by admin
export const updateNotificationStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notificationId = req.params.id;
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return next(new ErrorHandler('Notification not found', 404));
        }

        notification.status = 'read';
        await notification.save();

        const notifications = await Notification.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        next(new ErrorHandler(error, 500));
    }
});
