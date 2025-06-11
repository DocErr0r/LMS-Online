import express, { NextFunction, Request, Response } from 'express';
export const app = express();

app.get('/test', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Hello World',
    });
});

app.get('*', (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route not found - ${req.originalUrl}`) as any;
    err.statusCode = 404;
    next(err);
});