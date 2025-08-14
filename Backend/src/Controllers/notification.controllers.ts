import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import Notification from '../Models/Notification.model';
import cron from 'node-cron';

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

// delete notifacation every midnight
cron.schedule('0 0 0 * * *', async () => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        // delete notifications older than 30 days which are read
        await Notification.deleteMany({ status: 'read', createdAt: { $lt: thirtyDaysAgo } });
        console.log('Read notifications deleted successfully');
    } catch (error) {
        console.error('Error deleting read notifications:', error);
    }
});
