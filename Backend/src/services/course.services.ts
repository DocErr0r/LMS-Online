import { NextFunction, Request, Response } from 'express';
import { Course } from '../Models/Course.model';
import ErrorHandler from '../Utils/ErrorHnadler';
import { redis } from '../config/redis';

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

export const getAllCourseService = async (notforUnpaid: string, res: Response, next: NextFunction) => {
    try {
        const courses = await Course.find({}).select(notforUnpaid);
        if (!courses || courses.length === 0) {
            return next(new ErrorHandler('No courses found', 404));
        }
        // cache the courses in redis
        await redis.set('allCourses', JSON.stringify(courses));
        res.status(200).json({
            success: true,
            courses,
        });
        // return courses;
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
};
