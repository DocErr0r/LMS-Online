import cookieParser from 'cookie-parser';
require('dotenv').config();
import express, { NextFunction, Request, Response } from 'express';
export const app = express();
import cors from 'cors';
import { ErrorMiddleWare } from './Middlewares/Errors';
import { UserRouter } from './Routes/UserRoute';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    }),
);

app.use('/api/v1', UserRouter);

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

app.use(ErrorMiddleWare);
