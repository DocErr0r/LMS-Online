import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redis } from '../config/redis';

export const isAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token as string;
    if (!token) {
        return next(new ErrorHandler(401, 'Please Login to access this resource'));
    }
    const decoded = jwt.verify(token, process.env.AccessToken as string) as JwtPayload;
    if (!decoded) {
        return next(new ErrorHandler(400, 'Access token is invalid or expired, please login again'));
    }
    const user = await redis.get(decoded.id as string);
    if (!user) {
        return next(new ErrorHandler(400, 'User not found, please login again'));
    }
    req.user = JSON.parse(user);
    next();
});
