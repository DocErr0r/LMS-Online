import { NextFunction, Request, Response } from 'express';
import { Course } from '../Models/Course.model';
import ErrorHandler from '../Utils/ErrorHnadler';
import { redis } from '../config/redis';

export const saveCourse = async (course: Object, res: Response, next: NextFunction) => {
    const newCourse = await Course.create(course);
    res.status(201).json({
        success: true,
        message: 'Course created successfully',
        course: newCourse,
    });
};

export const isHaveCourseByUser = async (courseId: string, userCourses: any, res: Response, next: NextFunction) => {
    const exitCoures = userCourses?.find((course: any) => course.courseId.toString() === courseId);
    return exitCoures;
};

export const getAllCourseService = async (notforUnpaid: string, res: Response, next: NextFunction) => {
    const courses = await Course.find({}).select(notforUnpaid);
    if (!courses || courses.length === 0) {
        return next(new ErrorHandler('No courses found', 404));
    }
    // cache the courses in redis
    await redis.setex('allCourses', 60 * 60, JSON.stringify(courses));
    return res.status(200).json({
        success: true,
        courses,
    });
    // return courses;
};
