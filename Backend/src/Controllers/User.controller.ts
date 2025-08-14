import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import User, { IUser } from '../Models/UserModal';
import jwt, { Secret } from 'jsonwebtoken';
import { SendMail } from '../Utils/SendMail';
import { AccessCookieOptions, clrearCookies, RefreshCookieOptions, setCookies } from '../Utils/UserUtils';
import { redis } from '../config/redis';
import { getAllUsers, getUserDetails } from '../services/User.services';

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

// user -> auth required
// logout
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
        // redis.setex(user._id as string,6*60,JSON.stringify(user))

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

// update profile
interface updateProfileBody {
    name: string;
    email: string;
    avatar?: string;
}
export const updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id as string;
        const { name, email, avatar } = req.body as updateProfileBody;

        const user = (await User.findById(userId)) as IUser;
        if (user && email) {
            const isExist = (await User.findOne({ email })) as any;
            if (isExist && isExist._id.toString() !== userId) {
                return next(new ErrorHandler('Email already exists', 400));
            }
            user.email = email;
        }
        user.name = name;

        if (avatar) {
            user.avatar = {
                public_id: Date.now().toString(), // Placeholder for public_id, you can replace it with actual logic if using cloudinary',
                url: avatar,
            };
            // if (user.avatar) {
            //     // destroy old avatar if exists
            //     await coludinary.v2.uploader.destroy(user.avatar.public_id);
            //     const upload = await cloudinary.v2.uploader.upload(avatar, { folder: 'avatars' });
            //     user.avatar = { public_id: upload.public_id, url: upload.secure_url };
            // } else {
            //     const upload = await cloudinary.v2.uploader.upload(avatar, { folder: 'avatars' });
            //     user.avatar = { public_id: upload.public_id, url: upload.secure_url };
            // }
        }
        await user.save({ validateBeforeSave: true });
        redis.setex(user._id as string, 60 * 6, JSON.stringify(User));

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user,
        });
    } catch (error: any) {
        next(new ErrorHandler(error, 400));
    }
});

// update password
interface updatePasswordBody {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const updatePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id as string;
        const { oldPassword, newPassword, confirmPassword } = req.body as updatePasswordBody;
        if (!oldPassword || !newPassword || !confirmPassword) {
            return next(new ErrorHandler('Please provide all fields', 400));
        }
        if (newPassword !== confirmPassword) {
            return next(new ErrorHandler('Passwords do not match', 400));
        }

        const user = await User.findById(userId).select('+password');
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        const isMatched = await user.comparePassword(oldPassword);
        if (!isMatched) {
            return next(new ErrorHandler('Old password is incorrect', 400));
        }
        user.password = newPassword;
        await user.save({ validateBeforeSave: true });

        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error: any) {
        next(new ErrorHandler(error, 400));
    }
});

// get all users -- admin only
export const getallUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        getAllUsers(res, next);
    } catch (error: any) {
        next(new ErrorHandler(error, 400));
    }
});
