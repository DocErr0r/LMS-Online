import { Request, Response } from 'express';
import { IUser } from '../Models/UserModal';
import { redis } from '../config/redis';

interface IcookieOptions {
    expires: Date;
    httpOnly: boolean;
    maxAge: number;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none' | undefined;
}

const ExpriesAccess = parseInt(process.env.EXPIRE_ATOKEN || '5');
const ExpriesRefresh = parseInt(process.env.EXPIRE_REFRESH || '3');

export const AccessCookieOptions: IcookieOptions = {
    expires: new Date(Date.now() + ExpriesAccess * 60 * 1000),
    httpOnly: true,
    maxAge: ExpriesAccess * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
};
export const RefreshCookieOptions: IcookieOptions = {
    expires: new Date(Date.now() + ExpriesRefresh * 24 * 60 * 60 * 1000),
    httpOnly: true,
    maxAge: ExpriesRefresh * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
};

export const setCookies = (res: Response, user: IUser): void => {
    const AccessToken = user.AccessToken();
    const RefreshToken = user.RefreshToken();

    // remove password from user object before sending to client
    const { password, ...userWithoutPassword } = user.toObject();

    redis.set(user._id as string, JSON.stringify(userWithoutPassword));

    res.cookie('token', AccessToken, AccessCookieOptions);
    res.cookie('refreshToken', RefreshToken, RefreshCookieOptions);

    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        AccessToken,
    });
};

export const clrearCookies = (req: Request, res: Response): void => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    const userId = (req.user._id as string) || '';
    redis.del(userId);
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};
