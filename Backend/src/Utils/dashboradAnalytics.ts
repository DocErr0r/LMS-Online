// generate dashboard analytics data
import { NextFunction, Request, Response } from 'express';
import User from '../Models/UserModal';
import Order from '../Models/Order.model';
import { Course } from '../Models/Course.model';
import { asyncHandler } from './AsyncHandler';
import ErrorHandler from './ErrorHnadler';
import { analyticsOfLastYear } from '../services/analytics.services';

// get total users, orders, courses, and revenue
export const getDashboardTotals = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalCourses = await Course.countDocuments();
        // const totalCategories = await Category.countDocuments();

        // Revenue
        const revenue = await Order.aggregate([
            // { $match: { status: 'completed' } },
            { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' } },
            { $unwind: '$course' },
            { $group: { _id: null, total: { $sum: '$course.price' } } },
        ]);
        const totalRevenue = revenue[0]?.total || 0;

        // Top 5 courses
        const topcourses = await Order.aggregate([
            {
                $group: {
                    _id: '$courseId',
                    sales: { $sum: 1 },
                },
            },
            { $sort: { sales: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            { $unwind: '$course' },
            {
                $project: {
                    _id: 0,
                    course: '$course.name',
                    sales: 1,
                    revenue: { $multiply: ['$sales', '$paymentInfo.amount'] },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalOrders,
                totalCourses,
                totalRevenue,
            },
            topcourses,
        });
    } catch (error) {
        next(new ErrorHandler(error, 500));
    }
});

// get dashboard analytics data of 1 year (last 12 months)
export const getDashboardAnalytics = asyncHandler(async (req: Request, res: Response, next:NextFunction) => {
    try {
        const MonthSales = await analyticsOfLastYear(Order);
        const MonthUsers = await analyticsOfLastYear(User);
        const MonthCourses = await analyticsOfLastYear(Course);


        res.status(200).json({
            success: true,
            charts :{
                MonthSales,
                MonthUsers,
                MonthCourses,
            }
        });
    } catch (error:any) {
        console.log(error)
        next(new ErrorHandler(error, 500));
    }
});