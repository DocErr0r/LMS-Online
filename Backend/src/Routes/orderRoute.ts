import express from 'express';
import { authRole, isAuth } from '../Middlewares/auth';
import { createOrder, getAllOrders } from '../Controllers/order.controllers';
const router = express.Router();

router.post('/create', [isAuth], createOrder);
router.get('/admin/orders', [isAuth, authRole('admin')], getAllOrders);
export const OrderRoutes = router;
