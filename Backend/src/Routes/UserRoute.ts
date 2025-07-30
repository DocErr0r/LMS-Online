import express from 'express';
import { loginUser, LogoutUser, registerUser } from '../Controllers/User.controller';
import { isAuth } from '../Middlewares/auth';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', isAuth, LogoutUser);

export const UserRouter = router;
