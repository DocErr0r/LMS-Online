import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import mongoose from 'mongoose';
import ErrorHandler from '../Utils/ErrorHnadler';

export const validId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (mongoose.isValidObjectId(id)) {
        next();
    } else {
        return next(new ErrorHandler('Invalid ID format', 400));
    }
});
