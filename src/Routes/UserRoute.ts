import express from "express";
import { registerUser } from "../Controllers/User.controller";
const router =express.Router();

router.post('/register', registerUser);



export const UserRouter=router;