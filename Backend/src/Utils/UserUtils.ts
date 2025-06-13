import { Response } from 'express';
import { IUser } from '../Models/UserModal';
import { redis } from '../config/redis';

interface IcookieOptions {
    expires: Date;
    httpOnly: boolean;
    maxAge: number;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none' | undefined;
}

export const setCookies = (res: Response, user: IUser): void => {
    const AccessToken = user.AccessToken();
    const RefreshToken = user.RefreshToken();

    // redis.set(user._id as string, JSON.stringify(user))

    const ExpriesAccess = parseInt(process.env.EXPIRE_ATOKEN || '300', 10);
    const ExpriesRefresh = parseInt(process.env.EXPIRE_REFRESH || '1200', 10);

    const AccessCookieOptions: IcookieOptions = {
        expires: new Date(Date.now() + ExpriesAccess * 1000),
        httpOnly: true,
        maxAge: ExpriesAccess * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };
    const RefreshCookieOptions: IcookieOptions = {
        expires: new Date(Date.now() + ExpriesRefresh * 1000),
        httpOnly: true,
        maxAge: ExpriesRefresh * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };
    res.cookie('token', AccessToken, AccessCookieOptions);
    res.cookie('refreshToken', RefreshToken, RefreshCookieOptions);

    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        user,
        AccessToken,
    });
};

export const clrearCookies = (res: Response): void => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};
