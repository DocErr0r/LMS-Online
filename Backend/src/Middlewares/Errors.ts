import ErrorHandler from '../Utils/ErrorHnadler';
import { Request, Response, NextFunction } from 'express';

export const ErrorMiddleWare = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err,err.statusCode, err.message);
    
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    if (err.name === 'castError') {
        const message = `Resouse not found.Invalid - ${err.path}:${err.value}`;
        err = new ErrorHandler(404, message);
    }
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(400, message);
    }
    if (err.name === 'jsonWebTokenError') {
        const message = 'Json Web Token is invalid.Try Again!!!';
        err = new ErrorHandler(400, message);
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Json Web Token is Expired.Try Again!!!';
        err = new ErrorHandler(400, message);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
