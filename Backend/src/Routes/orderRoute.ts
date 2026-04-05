import express from 'express';
import { authRole, isAuth } from '../Middlewares/auth';
import { createOrder, getAllOrders, getMyOrders } from '../Controllers/order.controllers';
const router = express.Router();

router.post('/create', [isAuth], createOrder);
router.get('/my-orders', [isAuth], getMyOrders);
router.get('/admin/orders', [isAuth, authRole('admin')], getAllOrders);
export const OrderRoutes = router;
