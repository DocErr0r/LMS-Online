import { NextFunction, Request, Response } from 'express';
import { Course } from '../Models/Course.model';
import ErrorHandler from '../Utils/ErrorHnadler';

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

export const isHaveCourseByUser = async (courseId: string, userCourses: any, res: Response, next: NextFunction) => {
    try {
        const exitCoures = userCourses.find((course: any) => course.courseId.toString() === courseId);
        if (!exitCoures) {
            return next(new ErrorHandler('you are not eligible to access this course', 404));
        }
        return exitCoures;
    } catch (err: any) {
        return next(err);
    }
};
