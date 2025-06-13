import express from 'express';
import { loginUser, LogoutUser, registerUser } from '../Controllers/User.controller';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', LogoutUser);

export const UserRouter = router;
