import express from 'express';
import { authRole, isAuth } from '../Middlewares/auth';
import { getNotifications, updateNotificationStatus } from '../Controllers/notification.controllers';
import { validId } from '../Middlewares/validId';
const router = express.Router();

router.get('/admin/all', [isAuth, authRole('admin')], getNotifications);
router.put('/read/:id', [validId, isAuth, authRole('admin')], updateNotificationStatus);

export const NotificationRoutes = router;
