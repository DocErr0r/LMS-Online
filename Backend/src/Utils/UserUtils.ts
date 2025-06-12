import { Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';

export const setCookies = (res: Response, token: string): void => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 24 * 60 * 60 * 1000,
    });
};

export const clrearCookies = (res: Response): void => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
    });
};
