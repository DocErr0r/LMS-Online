import express from 'express';
import { authRole, isAuth } from '../Middlewares/auth';
import { getDashboardAnalytics, getDashboardTotals } from '../Utils/dashboradAnalytics';
const router = express.Router();

router.get('/dashboard/totals', [isAuth, authRole('admin')],getDashboardTotals);
router.get('/dashboard/analytics', [isAuth, authRole('admin')],getDashboardAnalytics);

export const dashboardRoutes = router;
