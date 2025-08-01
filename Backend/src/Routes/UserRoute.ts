import express from 'express';
import { getUserProfile, loginUser, LogoutUser, registerUser, updateAccessToken, updatePassword, updateProfile } from '../Controllers/User.controller';
import { isAuth } from '../Middlewares/auth';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/refresh-token', updateAccessToken);
router.get('/logout', isAuth, LogoutUser);
router.get('/me', isAuth, getUserProfile);
router.put('/me', isAuth, updateProfile);
router.put('/me/update-password', isAuth, updatePassword);

export const UserRouter = router;
