import express from 'express';
import { loginUser, LogoutUser, registerUser } from '../Controllers/User.controller';
import { authRole, isAuth } from '../Middlewares/auth';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', isAuth, authRole('admin'), LogoutUser);

export const UserRouter = router;
