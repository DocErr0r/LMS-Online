import express from 'express';
import { activationUser, registerUser } from '../Controllers/User.controller';
const router = express.Router();

router.post('/register', registerUser);
router.post('/activate-user', activationUser);

export const UserRouter = router;