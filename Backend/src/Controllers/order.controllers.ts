import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import { Course } from '../Models/Course.model';
import { redis } from '../config/redis';
import mongoose, { isValidObjectId } from 'mongoose';
import Order from '../Models/Order.model';
import Notification from '../Models/Notification.model';
import User, { IUser } from '../Models/UserModal';
import { updateUserDetails } from '../services/User.services';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import { getExpactedSign } from '../services/order.services';

// create Razorpay order
interface paymentBody {
    courseId: string;
}
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
export const createRazorpayOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId } = req.body as paymentBody;
        if (!isValidObjectId(courseId)) {
            return next(new ErrorHandler('Invalid course ID', 400));
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new ErrorHandler('Course not found', 404));
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }
        const userCourses = user.courses.some((course: any) => course.courseId.toString() === courseId);
        if (userCourses) {
            return next(new ErrorHandler('You have already purchased this course', 400));
        }
        let amount = course?.price || course?.estimatedPrice;
        if (!amount) {
            amount = 0;
        }

        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `rcpt_${uuidv4().substring(0, 30)}`,
        };
        const order = await razorpay.orders.create(options);
        res.status(201).json({
            success: true,
            order,
            message: 'Order Payment Created Successfully.',
        });
    } catch (error: any) {
        console.log(error);
        return next(new ErrorHandler(error, error?.statusCode));
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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let { courseId, paymentInfo } = req.body as CreateOrderRequest;
        if (!courseId || !paymentInfo.razorpay_order_id || !paymentInfo.razorpay_payment_id || !paymentInfo.razorpay_signature) {
            return next(new ErrorHandler('Missing required payment fields', 400));
        }
        if (!isValidObjectId(courseId)) {
            return next(new ErrorHandler('Invalid course ID', 400));
        }
        const user = await User.findById(req.user._id).session(session);
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }
        const isAlreadyEnrolled = user.courses.some((c: any) => c.courseId.toString() === courseId);
        if (isAlreadyEnrolled) {
            return next(new ErrorHandler('Already purchased this course', 400));
        }
        const course = await Course.findById(courseId).session(session);
        if (!course) {
            return next(new ErrorHandler('Course not found', 404));
        }

        const expectedSign = await getExpactedSign(paymentInfo, res, next);
        if (!expectedSign) {
            return next(new ErrorHandler('Invalid Signature, Fraud Attempt!', 403));
        }
        if (expectedSign !== paymentInfo.razorpay_signature) {
            return next(new ErrorHandler('Invalid Signature, Fraud Attempt!', 403));
        }
        const razorpayOrder = await razorpay.orders.fetch(paymentInfo.razorpay_order_id);
        const actualPrice = course.price || course.estimatedPrice || 0;

        if (razorpayOrder.amount !== actualPrice * 100) {
            return next(new ErrorHandler('Price mismatch! Security violation.', 400));
        }

        const order = await Order.create(
            [
                {
                    userId: user._id,
                    courseId: course._id,
                    paymentInfo: { ...paymentInfo, amount: actualPrice },
                },
            ],
            { session },
        );
        await User.findByIdAndUpdate(
            user._id,
            {
                $push: { courses: { courseId: course._id } },
            },
            { session },
        );

        await Course.findByIdAndUpdate(
            courseId,
            {
                $inc: { purchased: 1 },
            },
            { session },
        );

        await Notification.create(
            [
                {
                    userId: user._id,
                    title: 'New Order',
                    message: `You have new order form course: ${course.name}`,
                },
            ],
            { session },
        );
        await session.commitTransaction();
        session.endSession();
        updateUserDetails(user._id as string, user);

        res.status(201).json({
            success: true,
            order: order[0],
            message: 'Course enrolled successfully',
        });
    } catch (err: any) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler(err.message, 500));
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
