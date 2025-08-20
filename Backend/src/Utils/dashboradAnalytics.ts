// generate dashboard analytics data
import { NextFunction, Request, Response } from 'express';
import User from '../Models/UserModal';
import Order from '../Models/Order.model';
import { Course } from '../Models/Course.model';
import { asyncHandler } from './AsyncHandler';
import ErrorHandler from './ErrorHnadler';
import { analyticsOfLastYear } from '../services/analytics.services';

// Calculate percentage changes
const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
};

// get total users, orders, courses, and revenue with percentage changes
export const getDashboardTotals = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // get current and 30 days ago date
        const cDate = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setMonth(cDate.getMonth() - 1);

        // current data
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

        // last month data
        const lasttotalUsers = await User.countDocuments({ createdAt: { $lt: thirtyDaysAgo } });
        const lasttotalOrders = await Order.countDocuments({ createdAt: { $lt: thirtyDaysAgo } });
        const lasttotalCourses = await Course.countDocuments({ createdAt: { $lt: thirtyDaysAgo } });
        // const lasttotalCategories = await Category.countDocuments({ createdAt: { $lt: thirtyDaysAgo } });

        // Revenue
        const lastrevenue = await Order.aggregate([{ $match: { createdAt: { $lte: thirtyDaysAgo } } }, { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' } }, { $unwind: '$course' }, { $group: { _id: null, total: { $sum: '$course.price' } } }]);
        const lasttotalRevenue = lastrevenue[0]?.total || 0;

        const userPercentageChange = calculatePercentageChange(totalUsers, lasttotalUsers);
        const orderPercentageChange = calculatePercentageChange(totalOrders, lasttotalOrders);
        const coursePercentageChange = calculatePercentageChange(totalCourses, lasttotalCourses);
        const revenuePercentageChange = calculatePercentageChange(totalRevenue, lasttotalRevenue);

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
                totalUsers: {
                    value: totalUsers,
                    percentageChange: userPercentageChange,
                },
                totalOrders: {
                    value: totalOrders,
                    percentageChange: orderPercentageChange,
                },
                totalCourses: {
                    value: totalCourses,
                    percentageChange: coursePercentageChange,
                },
                totalRevenue: {
                    value: totalRevenue,
                    percentageChange: revenuePercentageChange,
                },
            },
            topcourses,
        });
    } catch (error) {
        next(new ErrorHandler(error, 500));
    }
});

// get dashboard analytics data of 1 year (last 12 months)
export const getDashboardAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const MonthSales = await analyticsOfLastYear(Order);
        const MonthUsers = await analyticsOfLastYear(User);
        const MonthCourses = await analyticsOfLastYear(Course);

        res.status(200).json({
            success: true,
            charts: {
                MonthSales,
                MonthUsers,
                MonthCourses,
            },
        });
    } catch (error: any) {
        console.log(error);
        next(new ErrorHandler(error, 500));
    }
});
