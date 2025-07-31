import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import User from '../Models/UserModal';
import jwt, { Secret } from 'jsonwebtoken';
import { SendMail } from '../Utils/SendMail';
import { AccessCookieOptions, clrearCookies, RefreshCookieOptions, setCookies } from '../Utils/UserUtils';
import { redis } from '../config/redis';
import { getUserDetails } from '../services/User.services';

interface bodyInterface {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

// register user
export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body as bodyInterface;
        if (!name || !email || !password) {
            return next(new ErrorHandler('Please provide all fields', 400));
        }

        const isExist = await User.findOne({ email });
        if (isExist) {
            return next(new ErrorHandler('User already exist with this email', 400));
        }

        const user: bodyInterface = {
            name,
            email,
            password,
        };
        const userCreated = await User.create(user);
        res.status(201).json({
            success: true,
            message: 'User created successfully',
        });
    } catch (err: any) {
        next(new ErrorHandler(err, 400));
    }
});

// login user
interface loginBody {
    email: string;
    password: string;
}
export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as loginBody;
        if (!email || !password) {
            return next(new ErrorHandler('Please provide email and password', 400));
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new ErrorHandler('Invalid email or password', 401));
        }
        const isMatched = await user.comparePassword(password);
        if (!isMatched) {
            return next(new ErrorHandler('Invalid email or password', 400));
        }
        setCookies(res, user);
    } catch (error: any) {
        next(new ErrorHandler(error, 400));
    }
});

// logout user -> auth required
export const LogoutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        clrearCookies(req, res);
    } catch (error: any) {
        next(new ErrorHandler(error, 400));
    }
});

// update acess token
export const updateAccessToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return next(new ErrorHandler('Please login first', 401));
        }
        const decoded = jwt.verify(refreshToken, process.env.RefreshToken as Secret) as jwt.JwtPayload;

        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }
        const newAccessToken = user.AccessToken();
        const newRefreshToken = user.RefreshToken();

        res.cookie('token', newAccessToken, AccessCookieOptions);
        res.cookie('refreshToken', newRefreshToken, RefreshCookieOptions);
        return res.status(200).json({
            success: true,
            message: 'Access token updated successfully',
            newAccessToken,
        });
    } catch (error: any) {
        next(new ErrorHandler(error, 400));
    }
});

// get user profile
export const getUserProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id as string;
        getUserDetails(userId, res);
    } catch (error: any) {
        next(new ErrorHandler(error, 400));
    }
});
