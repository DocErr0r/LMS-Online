import { Request, Response, NextFunction } from 'express';

export const ErrorMiddleWare = (err: any, req: Request, res: Response, next: NextFunction) => {

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if (err.name === 'CastError') {
        message = `Resouse not found.Invalid - ${err.path}:${err.value}`;
        statusCode = 404;
    }
    if (err.name === 'JsonWebTokenError') {
        message = 'Json Web Token is invalid.Try Again!!!';
        statusCode = 400;
    }
    if (err.name === 'TokenExpiredError') {
        message = 'Json Web Token is Expired.Try Again!!!';
        statusCode = 400;
    }
    if (err.name === 'ValidationError') {
        message = err.message || 'Validation Error';;
        statusCode = 400;
    }
    if (err.name === 'ValidatorError') {
        message = `Validation failed: name: Path ${err.path} is required.`;
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
    });
};
