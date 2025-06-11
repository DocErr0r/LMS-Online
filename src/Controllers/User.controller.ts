import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import User from '../Models/UserModal';
import jwt, { Secret } from 'jsonwebtoken';
import { SendMail } from '../Utils/SendMail';

interface bodyInterface {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}
interface tokenInterface {
    token: string;
    activationToken: string;
}

const createActivation = (user: bodyInterface): tokenInterface => {
    const activationToken = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({ user, activationToken }, process.env.JWT_SECRET as Secret, {
        expiresIn: '5m',
    });
    return { token, activationToken };
};

export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body as bodyInterface;
        if (!name || !email || !password) {
            return next(new ErrorHandler(400, 'Please provide all fields'));
        }

        const isExist = await User.findOne({ email });
        if (isExist) {
            return next(new ErrorHandler(400, 'User already exist with this email'));
        }

        const user: bodyInterface = {
            name,
            email,
            password,
        };

        const { token, activationToken } = createActivation(user);
        const mailOptions = {
            user: email,
            subject: 'Account Activation',
            template:'mail-code.ejs',
            data: { user: { name: user.name }, activationToken },
        };
        try {
            await SendMail(mailOptions);
            res.status(201).json({
                success: true,
                message: `Please check your email ${user.email} to activate your account`,
                token,
            });
        } catch (error: any) {
            return next(new ErrorHandler(500, 'Error sending activation email'));
        }
    } catch (err: any) {
        next(new ErrorHandler(400, err.message));
    }
});