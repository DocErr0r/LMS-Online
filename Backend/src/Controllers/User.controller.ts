import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import User from '../Models/UserModal';
import jwt, { Secret } from 'jsonwebtoken';
import { SendMail } from '../Utils/SendMail';
import { clrearCookies, setCookies } from '../Utils/UserUtils';

interface bodyInterface {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body as bodyInterface;
        if (!name || !email || !password) {
            return next(new ErrorHandler(400, 'Please provide all fields'));
        }

        const isExist = await User.findOne({ email });
        if (isExist) {
            return next(new ErrorHandler(400, 'User already exist with this email'));
        }

        const user: bodyInterface = {
            name,
            email,
            password,
        };

        try {
            const userCreated = await User.create(user);
            res.status(201).json({
                success: true,
                message: 'User created successfully',
            });
        } catch (error: any) {
            return next(new ErrorHandler(500, 'Error sending activation email'));
        }
    } catch (err: any) {
        next(new ErrorHandler(400, err.message));
    }
});

interface loginBody {
    email: string;
    password: string;
}
export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as loginBody;
        if (!email || !password) {
            return next(new ErrorHandler(400, 'Please provide email and password'));
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new ErrorHandler(401, 'Invalid email or password'));
        }
        const isMatched = await user.comparePassword(password);
        if (!isMatched) {
            return next(new ErrorHandler(400, 'Invalid email or password'));
        }
        setCookies(res, user);
    } catch (error: any) {
        next(new ErrorHandler(400, error.message));
    }
});

export const LogoutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        clrearCookies(res);
    } catch (error: any) {
        next(new ErrorHandler(400, error.message));
    }
});
