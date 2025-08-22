import exress from 'express'
import { authRole, isAuth } from '../Middlewares/auth'
import { createLayout, editLayout, getLayoutbyType } from '../Controllers/layout.controllers'
const router = exress.Router()

router.get('/layout',getLayoutbyType)
router.post('/create-layout',isAuth,authRole("admin"),createLayout)
router.put('/edit-layout',isAuth,authRole("admin"),editLayout)


export const LayouRoutes =router