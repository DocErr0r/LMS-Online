import express from 'express';
import { authRole, isAuth } from '../Middlewares/auth';
import { validId } from '../Middlewares/validId';
import { createCourse, editCourseById, getAllCourses } from '../Controllers/course.controllers';
const router = express.Router();

router.post('/create', isAuth, authRole('admin'), createCourse);
router.get('/all', getAllCourses);
router.route('/:id').put([validId, isAuth, authRole('admin')], editCourseById);

export const courseRouter = router;
