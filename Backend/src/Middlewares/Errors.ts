import ErrorHandler from '../Utils/ErrorHnadler';
import { Request, Response, NextFunction } from 'express';

export const ErrorMiddleWare = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err, err.name, err.code);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if (err.name === 'castError') {
        message = `Resouse not found.Invalid - ${err.path}:${err.value}`;
        statusCode = 404;
    }
    if (err.code === 11000) {
        message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        statusCode = 400;
    }
    if (err.name === 'jsonWebTokenError') {
        message = 'Json Web Token is invalid.Try Again!!!';
        statusCode = 400;
    }
    if (err.name === 'TokenExpiredError') {
        message = 'Json Web Token is Expired.Try Again!!!';
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
    });
};
