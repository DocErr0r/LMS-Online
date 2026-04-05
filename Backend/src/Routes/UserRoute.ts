import express from 'express';
import { deleteUser, getallUsers, getUserProfile, loginUser, LogoutUser, registerUser, socialLogin, updateAccessToken, updateAvatar, updatePassword, updateProfile, updateRole } from '../Controllers/User.controller';
import { authRole, isAuth } from '../Middlewares/auth';
import { validId } from '../Middlewares/validId';
import { processImages, uploadSingle } from '../Middlewares/multer';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/social-auth', socialLogin);

router.get('/refresh-token', updateAccessToken);
router.get('/logout', isAuth, LogoutUser);
router.get('/me', isAuth, getUserProfile);
router.put('/me', isAuth, updateProfile);
router.put('/me/update-avatar', isAuth, uploadSingle, processImages, updateAvatar);
router.put('/me/update-password', isAuth, updatePassword);

// Todo : forget and update password and reset password route

router.get('/admin/users', [isAuth, authRole('admin')], getallUsers);
router
    .route('/admin/users/:id')
    .put([validId, isAuth, authRole('admin', 'superAdmin')], updateRole)
    .delete([validId, isAuth, authRole('admin', 'superAdmin')], deleteUser);

export const UserRouter = router;
