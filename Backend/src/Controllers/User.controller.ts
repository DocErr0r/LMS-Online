import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import User, { IUser } from '../Models/UserModal';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { SendMail } from '../Utils/SendMail';
import { AccessCookieOptions, clrearCookies, RefreshCookieOptions, setCookies } from '../Utils/UserUtils';
import { redis } from '../config/redis';
import { getAllUsers, getUserDetails, updateRoleService } from '../services/User.services';
export const redisExpire = 60 * 60 * 24 * 7;

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

        const user = JSON.parse(await redis.get(decoded.id as string) || '{}') as IUser;
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        // New access and refresh token genreate other due to redis data  
        const newAccessToken = jwt.sign(
         { id: user._id },
          process.env.AccessToken as string,
          {
            expiresIn: (process.env.EXPIRE_ATOKEN || '5') + 'm',
          } as SignOptions,
        );
        const newRefreshToken = jwt.sign(
            { id: user._id },
            process.env.RefreshToken as string,
            {
                expiresIn: (process.env.EXPIRE_REFRESH || '3') + 'd',
            } as SignOptions,
        );

        res.cookie('token', newAccessToken, AccessCookieOptions);
        res.cookie('refreshToken', newRefreshToken, RefreshCookieOptions);
        redis.set(user._id as string, JSON.stringify(user), 'EX', redisExpire);

        return res.status(200).json({
            success: true,
            message: 'Access token updated successfully',
            newAccessToken,
        });
    } catch (error: any) {
        next(new ErrorHandler(error, 400));
    }
});

// Social Login || Sign Up
interface socialLoginBody {
    name: string;
    email: string;
    avatar?: string;
}
export const socialLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, avatar } = req.body as socialLoginBody;
        if (!name || !email) {
            return next(new ErrorHandler('Please provide name and email', 400));
        }
        const isExist = await User.findOne({ email });
        if (!isExist) {
            const user = await User.create({ name, email, avatar });
            setCookies(res, user);
        } else {
            setCookies(res, isExist);
        }
    } catch (error: any) {
        next(new ErrorHandler(error, 500));
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
        const { name, email } = req.body as updateProfileBody;

        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        if (user && email) {
            const isExist = (await User.findOne({ email })) as any;
            if (isExist && isExist._id.toString() !== userId) {
                return next(new ErrorHandler('Email already exists', 400));
            }
            user.email = email;
        }
        user.name = name;

        await user.save({ validateBeforeSave: true });
        redis.set(user._id as string, JSON.stringify(user), 'EX', redisExpire);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user,
        });
    } catch (error: any) {
        next(new ErrorHandler(error, 400));
    }
});

// update avatar
interface updateAvatarBody {
    public_id: string;
    url: string;
}
export const updateAvatar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id as string;
        const { public_id, url } = req.body as updateAvatarBody;
        if (!public_id || !url) {
            return next(new ErrorHandler('Please provide avatar', 400));
        }
        const user = await User.findById(userId) as IUser;
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        user.avatar = {
            public_id: Date.now().toString(), // Placeholder for public_id, you can replace it with actual logic if using cloudinary',
            url: url,
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

        await user.save({ validateBeforeSave: true });

        const { createdAt, updatedAt, __v, courses, ...userWithoutPassword } = user.toObject();
        redis.set(user._id as string, JSON.stringify(userWithoutPassword), 'EX', redisExpire);

        res.status(200).json({
            success: true,
            message: 'Avatar updated successfully',
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

// update user role by admin
interface updateRoleBody {
    role: string;
}
export const updateRole = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        const { role } = req.body as updateRoleBody;
        if (!role) {
            return next(new ErrorHandler('Please provide role', 400));
        }
        if (role !== 'user' && role !== 'admin') {
            return next(new ErrorHandler('Role can only be user or admin', 400));
        }
        // user cant change his own role
        if (req.user._id === userId) {
            return next(new ErrorHandler('You cannot change your own role', 403));
        }

        updateRoleService(req.user.role as string, userId, role, res, next);
    } catch (error: any) {
        next(new ErrorHandler(error, 400));
    }
});

// delete user by admin
export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return next(new ErrorHandler('Please provide user id', 400));
        }
        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }
        // not self delete admin user
        if (req.user._id === userId && req.user.role === 'admin') {
            return next(new ErrorHandler('You cannot delete your own account', 403));
        }
        // not delete admin user by other admin
        if (user.role === 'admin' && req.user.role !== 'superAdmin') {
            return next(new ErrorHandler('You cannot delete admin user', 403));
        }
        await user.deleteOne();
        redis.del(userId);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error: any) {
        next(new ErrorHandler(error, 400));
    }
});
