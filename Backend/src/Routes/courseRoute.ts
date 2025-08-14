import express from 'express';
import { authRole, isAuth } from '../Middlewares/auth';
import { validId } from '../Middlewares/validId';
import { addQuestion, addReply, addReview, createCourse, editCourseById, getAllCourses, getAllCoursesForAll, getCourseByIdForAll, getCourseByUser } from '../Controllers/course.controllers';
const router = express.Router();

// for all users without purchase
router.get('/all-courses', getAllCoursesForAll);
router.get('/all-courses/:id', validId, getCourseByIdForAll);

// course for valid users
router.put('/course-content/question',isAuth,addQuestion)
router.put('/course-content/reply',isAuth,addReply)
router.get('/course-content/:id', [validId, isAuth], getCourseByUser);

router.put('/review/:id', [validId, isAuth], addReview);

// for admin users
router.post('/create', isAuth, authRole('admin'), createCourse);
router.get('/admin/courses', isAuth, authRole('admin'), getAllCourses);
router.put('/edit/:id', [validId, isAuth, authRole('admin')], editCourseById);

export const courseRouter = router;
