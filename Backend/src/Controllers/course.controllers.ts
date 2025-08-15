import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import { Course } from '../Models/Course.model';
import { getAllCourseService, isHaveCourseByUser, saveCourse } from '../services/course.services';
import { redis } from '../config/redis';
import { isValidObjectId } from 'mongoose';
import Notification from '../Models/Notification.model';
import User from '../Models/UserModal';

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

// get all course - for all wihhout puechase
const notforUnpaid = '-courseData.videoUrl -courseData.videoThumbnail -courseData.videoPlayer -courseData.videSection -courseData.links -courseData.suggestions -courseData.questions';
export const getAllCoursesForAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // fetch from redis if available
        const cachedCourses = await redis.get('allCourses');
        if (cachedCourses) {
            return res.status(200).json({
                success: true,
                courses: JSON.parse(cachedCourses),
            });
        } else {
            getAllCourseService(notforUnpaid, res, next);
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// get course by id -- wihout purchase
export const getCourseByIdForAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;
        // fetch from redis if available
        const cachedCourse = await redis.get(courseId);
        if (cachedCourse) {
            return res.status(200).json({
                success: true,
                course: JSON.parse(cachedCourse),
            });
        } else {
            const course = await Course.findById(courseId).select(notforUnpaid);
            if (!course) {
                return next(new ErrorHandler('Course not found', 404));
            }
            // cache the course in redis
            await redis.set(courseId, JSON.stringify(course));
            res.status(200).json({
                success: true,
                course,
            });
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// get all courses for admin
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
        return next(new ErrorHandler(error, 500));
    }
});

//  get course content for valid user
export const getCourseByUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;
        const userCourses = req.user?.courses;
        isHaveCourseByUser(courseId, userCourses, res, next);

        const course = await Course.findById(courseId);
        if (!course) {
            return next(new ErrorHandler('Course not found', 404));
        }

        res.status(200).json({
            success: true,
            content: course.courseData,
        });
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
});

// add queation to specific course
interface quationBody {
    question: string;
    courseId: string;
    courseDataId: string;
}
export const addQuestion = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { question, courseDataId, courseId } = req.body as quationBody;
        const userCourses = req.user?.courses;
        isHaveCourseByUser(courseId, userCourses, res, next);

        if (!question || !courseId || !courseDataId) {
            return next(new ErrorHandler('Please provide all required fields', 400));
        }
        if (!isValidObjectId(courseDataId)) {
            return next(new ErrorHandler('Invalid: please provide valid ID', 400));
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new ErrorHandler('Course not found', 404));
        }

        const courseData = course?.courseData?.find((v) => v.id.toString() === courseDataId);

        const newQuestion: any = {
            user: req.user,
            question: question,
        };

        courseData?.questions.push(newQuestion);
        await course.save();

        // send notification to user who created the course
        const notification = await Notification.create({
            user: req.user,
            title: 'New Question',
            message: `You have a new question to the course ${courseData?.title}`,
        });

        res.status(201).json({
            success: true,
            course,
            message: 'Question added successfully',
        });
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
});

// reply of the questions or course
interface replyBody {
    reply: string;
    questionId: string;
    courseId: string;
    courseDataId: string;
}
export const addReply = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reply, questionId, courseDataId, courseId } = req.body as replyBody;
        const userCourses = req.user?.courses;
        isHaveCourseByUser(courseId, userCourses, res, next);

        if (!isValidObjectId(courseDataId)) {
            return next(new ErrorHandler('Invalid: please provide valid ID', 400));
        }
        if (!isValidObjectId(questionId)) {
            return next(new ErrorHandler('Invalid: please provide valid ID', 400));
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new ErrorHandler('Course not found', 404));
        }
        const courseData = course?.courseData?.find((v) => v.id.toString() === courseDataId);
        if (!courseData) {
            return next(new ErrorHandler('Course data not found', 404));
        }
        const question = courseData.questions?.find((q: any) => q._id.equals(questionId));
        if (!question) {
            return next(new ErrorHandler('Question not found', 404));
        }
        const newReply: any = {
            user: req.user,
            reply: reply,
        };
        question.replies?.push(newReply);
        await course.save();

        // add logic for notificaiton
        if (req.user._id === question.user.toString()) {
            const notification = await Notification.create({
                user: req.user,
                title: 'New Reply',
                message: `You have a new reply to question in the course: ${courseData.title}`,
            });
        } else {
            // send mail to the user who asked the question
        }

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            course,
        });
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
});

// add review to course
interface reviewBody {
    comment: string;
    rating: number;
}
export const addReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { comment, rating } = req.body as reviewBody;
        const courseId = req.params.id;
        const userCourses = req.user?.courses;
        isHaveCourseByUser(courseId, userCourses, res, next);

        if (!comment || !rating) {
            return next(new ErrorHandler('Please provide all required fields', 400));
        }
        if (rating < 1 || rating > 5) {
            return next(new ErrorHandler('Rating must be between 1 and 5', 400));
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new ErrorHandler('Course not found', 404));
        }
        // Check if the user has already reviewed the course
        const existingReview = course.reviews.find((review: any) => review.user.toString() === req.user._id);
        let newReview: any = {};
        if (existingReview) {
            newReview = {
                ...existingReview,
                comment,
                rating,
            };
            const index = course.reviews.indexOf(existingReview);
            course.reviews[index] = newReview;
        } else {
            newReview = {
                user: req.user._id,
                comment,
                rating,
            };
            course.reviews.push(newReview);
        }

        const totalRating = course.reviews.reduce((acc: number, review: any) => acc + review.rating, 0);

        course.rating = totalRating / course.reviews.length;

        await course.save();
        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            course,
        });
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
});

// delete course by id - admin only
export const deleteCourseById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findByIdAndDelete(courseId);
        if (!course) {
            return next(new ErrorHandler('Course not found', 404));
        }
        // remove course from redis cache
        await redis.del(courseId);
        // remove course from redis cache for all courses
        const cachedCourses = await redis.get('allCourses');
        if (cachedCourses) {
            const courses = JSON.parse(cachedCourses);
            const updatedCourses = courses.filter((c: any) => c._id.toString() !== courseId);
            await redis.set('allCourses', JSON.stringify(updatedCourses));
        }
        // remove course by user who purchased it
        
        const users = await User.updateMany({ 'courses.courseId': courseId }, { $pull: { courses: { courseId: courseId } } });
        // console.log(users);

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully',
        });
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
});
