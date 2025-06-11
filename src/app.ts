import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
export const app = express();
require('dotenv').config();
import cors from 'cors';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    }),
);

app.get('/test', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Hello World',
    });
});

app.all('*', (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route not found - ${req.originalUrl}`) as any;
    err.statusCode = 404;
    next(err);
});