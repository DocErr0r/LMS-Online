import express from 'express';
import { activationUser, loginUser, LogoutUser, registerUser } from '../Controllers/User.controller';
const router = express.Router();

router.post('/register', registerUser);
router.post('/activate-user', activationUser);
router.post('/login', loginUser);
router.get('/logout', LogoutUser);

export const UserRouter = router;
