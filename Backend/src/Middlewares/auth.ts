import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redis } from '../config/redis';

export const isAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token as string;
    if (!token) {
        return next(new ErrorHandler('Please Login to access this resource', 401));
    }
    const decoded = jwt.verify(token, process.env.AccessToken as string) as JwtPayload;
    if (!decoded) {
        return next(new ErrorHandler('Access token is invalid or expired, please login again', 400));
    }
    const user = await redis.get(decoded.id as string);
    if (!user) {
        return next(new ErrorHandler('User not found, please login again', 400));
    }
    req.user = JSON.parse(user);
    next();
});

export const authRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role || '')) {
            return next(new ErrorHandler(`Role: ${req.user?.role} is not allow to access this`, 403));
        }
    };
};
