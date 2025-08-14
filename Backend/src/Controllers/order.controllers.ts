import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import { Course } from '../Models/Course.model';
import { redis } from '../config/redis';
import { isValidObjectId } from 'mongoose';
import Order from '../Models/Order.model';
import Notification from '../Models/Notification.model';
import User from '../Models/UserModal';
import { updateUserDetails } from '../services/User.services';

// create oreder
interface CreateOrderRequest {
    courseId: string;
    paymentInfo: object;
}
export const createOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, paymentInfo } = req.body as CreateOrderRequest;
        if (!isValidObjectId(courseId)) {
            return next(new ErrorHandler('Invalid course ID', 400));
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }
        const userCourses = user.courses.some((course: any) => course.courseId.toString() === courseId);
        if (userCourses) {
            return next(new ErrorHandler('You have already purchased this course', 400));
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new ErrorHandler('Course not found', 404));
        }
        const order = await Order.create({
            userId: req.user._id,
            courseId: course._id,
            paymentInfo,
        });
        user.courses.push({ courseId: course._id as string });
        course.purchased ? (course.purchased += 1) : (course.purchased = 1);

        const notificaiton = await Notification.create({
            userId: user._id,
            title: 'New Order',
            message: `You have new order form course: ${course.name}`,
        });
  
        await course.save();
        await user.save();
        updateUserDetails(user._id as string, user);

        res.status(201).json({
            success: true,
            order,
            user,
            course,
            notificaiton,
        });
    } catch (err: any) {
        return next(new ErrorHandler(err, 500));
    }
});
