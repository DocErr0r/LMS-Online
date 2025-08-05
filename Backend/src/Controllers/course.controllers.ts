import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import { Course } from '../Models/Course.model';
import { saveCourse } from '../services/course.services';

interface CourseBody {
    name: string;
    description: string;
    price: number;
    estimatedPrice?: number;
    thumbnail: {
        public_id: string;
        url: string;
    };
    tags: string;
    level: string;
    demoUrl: string;
    benefits?: string[];
    prerequisites?: string[];
    courseData: {
        title: string;
        description: string;
        videoUrl: string;
        links?: { title: string; url: string }[];
        videoThumbnail?: object;
        videoSection: string;
        videoLength: string;
        videoPlayer?: string;
        suggestions?: string[];
    }[];
}

// create course
export const createCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, price, estimatedPrice, thumbnail, tags, level, demoUrl, courseData, benefits, prerequisites } = req.body as CourseBody;
    // Validate required fields
    if (!name || !description || !price || !estimatedPrice || !thumbnail || !tags || !level || !demoUrl || !courseData) {
        return next(new ErrorHandler('Please provide all required fields', 400));
    }
    // coursedata values inside array
    const courseDataArray = courseData.map((data: any) => ({
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        links: data.links || [],
        videoThumbnail: data.videoThumbnail || {},
        videSection: data.videoSection,
        videoLength: data.videoLength,
        videoPlayer: data.videoPlayer,
        suggestions: data.suggestions || [],
    }));
    const course = {
        name,
        description,
        price,
        estimatedPrice,
        thumbnail,
        tags,
        level,
        demoUrl,
        benefits: benefits || [],
        prerequisites: prerequisites || [],
        courseData: courseDataArray || [],
    };
    saveCourse(course, res, next);
});

// get all courses
export const getAllCourses = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await Course.find({});
        if (!courses || courses.length === 0) {
            return next(new ErrorHandler('No courses found', 404));
        }
        res.status(200).json({
            success: true,
            courses,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// edit course by id
export const editCourseById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;
        const { name, demoUrl, description, price, estimatedPrice, thumbnail, tags, level, benefits, courseData, prerequisites } = req.body as CourseBody;
        const newCourseData = {
            name,
            description,
            price,
            estimatedPrice,
            thumbnail,
            tags,
            level,
            demoUrl,
            benefits: benefits || [],
            prerequisites: prerequisites || [],
            courseData: courseData || [],
        };
        const updatedCourse = await Course.findByIdAndUpdate(courseId, newCourseData, { new: true });
        if (!updatedCourse) {
            return next(new ErrorHandler('Course not found', 404));
        }
        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course: updatedCourse,
        });
    } catch (error) {}
});
