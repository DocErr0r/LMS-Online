import express from 'express';
import { authRole, isAuth } from '../Middlewares/auth';
import { validId } from '../Middlewares/validId';
import { addQuestion, addReply, addReview, createCourse, deleteCourseById, editCourseById, getAllCourses, getAllCoursesForAll, getCourseByIdForAll, getCourseByUser } from '../Controllers/course.controllers';
const router = express.Router();

// for all users without purchase
router.get('/all-courses', getAllCoursesForAll);
router.get('/all-courses/:id', validId, getCourseByIdForAll);

// course for valid users
router.put('/course-content/question', isAuth, addQuestion);
router.put('/course-content/reply', isAuth, addReply);
router.get('/course-content/:id', [validId, isAuth], getCourseByUser);

router.put('/review/:id', [validId, isAuth], addReview);

// for admin users
router.get('/admin/courses', isAuth, authRole('admin'), getAllCourses);
router.post('/admin/courses/create', isAuth, authRole('admin'), createCourse);
router
    .route('/admin/courses/:id')
    .put([validId, isAuth, authRole('admin')], editCourseById)
    .delete([validId, isAuth, authRole('admin')], deleteCourseById);

export const courseRouter = router;
