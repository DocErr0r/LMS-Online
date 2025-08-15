import express from 'express';
import { deleteUser, getallUsers, getUserProfile, loginUser, LogoutUser, registerUser, updateAccessToken, updatePassword, updateProfile, updateRole } from '../Controllers/User.controller';
import { authRole, isAuth } from '../Middlewares/auth';
import { validId } from '../Middlewares/validId';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/refresh-token', updateAccessToken);
router.get('/logout', isAuth, LogoutUser);
router.get('/me', isAuth, getUserProfile);
router.put('/me', isAuth, updateProfile);
router.put('/me/update-password', isAuth, updatePassword);

router.get('/admin/users', [isAuth, authRole('admin')], getallUsers);
router
    .route('/admin/users/:id')
    .put([validId, isAuth, authRole('admin')], updateRole)
    .delete([validId, isAuth, authRole('admin')], deleteUser);

export const UserRouter = router;
