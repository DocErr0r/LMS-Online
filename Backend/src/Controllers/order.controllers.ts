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
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import { getExpactedSign } from '../services/order.services';

// create Razorpay order
interface paymentBody {
    courseId: string;
}
export const createRazorpayOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId } = req.body as paymentBody;
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
        let amount = course?.price || course?.estimatedPrice;
        if (!amount) {
            amount = 0;
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `rcpt_${uuidv4()}`,
        };
        const order = await razorpay.orders.create(options);
        res.status(201).json({
            success: true,
            order,
            message: 'Order Payment Created Successfully.',
        });
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
});

// create oreder
interface CreateOrderRequest {
    courseId: string;
    paymentInfo: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        amount?: number;
    };
}
export const createOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { courseId, paymentInfo } = req.body as CreateOrderRequest;
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
        // calculate payment and info
        const amount = course.price || course.estimatedPrice;

        const expectedSign = await getExpactedSign(paymentInfo, res, next);
        if (!expectedSign) {
            return next(new ErrorHandler('Invalid Signature, Fraud Attempt!', 403));
        }
        if (expectedSign !== paymentInfo.razorpay_signature) {
            return next(new ErrorHandler('Invalid Signature, Fraud Attempt!', 403));
        }
        paymentInfo = {
            ...paymentInfo,
            amount,
        };

        const order = await Order.create({
            userId: req.user._id,
            courseId: course._id,
            paymentInfo,
        });
        user.courses.push({ courseId: course._id as string });
        // increase course puchased
        course.purchased = (course.purchased ?? 0) + 1;
        // course.purchased ? (course.purchased += 1) : (course.purchased = 1);

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
            // user,
            // course,
            // notificaiton,
        });
    } catch (err: any) {
        return next(new ErrorHandler(err, 500));
    }
});

// get my orders for user
export const getMyOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find({ userId: req.user?._id }).populate('userId', 'name email').populate('courseId', 'name price');

        if (!orders || orders.length === 0) {
            return next(new ErrorHandler('No orders found', 404));
        }
        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        next(new ErrorHandler(error, 500));
    }
});

// get all orders for admin
export const getAllOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find().populate('userId', 'name email').populate('courseId', 'name price');
        if (!orders || orders.length === 0) {
            return next(new ErrorHandler('No orders found', 404));
        }
        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        next(new ErrorHandler(error, 500));
    }
});
