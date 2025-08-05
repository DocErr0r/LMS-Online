import { NextFunction, Request, Response } from 'express';
import { Course } from '../Models/Course.model';

export const saveCourse = async (course: Object, res: Response, next: NextFunction) => {
    try {
        const newCourse = await Course.create(course);
        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            course: newCourse,
        });
    } catch (err: any) {
        return next(err);
    }
};
