import express from 'express';
import { getUserProfile, loginUser, LogoutUser, registerUser, updateAccessToken } from '../Controllers/User.controller';
import { isAuth } from '../Middlewares/auth';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/logout', isAuth, LogoutUser);
router.get('/refresh-token', isAuth, updateAccessToken);

router.get('/me', isAuth, getUserProfile);
export const UserRouter = router;
