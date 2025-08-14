import express from 'express';
import { isAuth } from '../Middlewares/auth';
import { createOrder } from '../Controllers/order.controllers';
const router = express.Router();

router.post('/create', [isAuth], createOrder);

export const OrderRoutes = router;
