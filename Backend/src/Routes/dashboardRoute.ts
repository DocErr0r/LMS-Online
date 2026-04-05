import express from 'express';
import { authRole, isAuth } from '../Middlewares/auth';
import { getDashboardAnalytics, getDashboardTotals } from '../Controllers/dashboardAnalytics.controllers';
const router = express.Router();

router.get('/dashboard/totals', [isAuth, authRole('admin', 'superAdmin')], getDashboardTotals);
router.get('/dashboard/analytics', [isAuth, authRole('admin', 'superAdmin')], getDashboardAnalytics);

export const dashboardRoutes = router;
