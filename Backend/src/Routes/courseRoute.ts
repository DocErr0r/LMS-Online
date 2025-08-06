import express from 'express';
import { authRole, isAuth } from '../Middlewares/auth';
import { validId } from '../Middlewares/validId';
import { createCourse, editCourseById, getAllCourses, getAllCoursesForAll, getCourseByIdForAll } from '../Controllers/course.controllers';
const router = express.Router();

// for all users without purchase
router.get('/all-courses', getAllCoursesForAll);
router.get('/all-courses/:id', validId, getCourseByIdForAll);

// for admin users
router.post('/create', isAuth, authRole('admin'), createCourse);
router.get('/admin/all-course', isAuth, authRole('admin'), getAllCourses);
router.route('/edit/:id').put([validId, isAuth, authRole('admin')], editCourseById);

export const courseRouter = router;
