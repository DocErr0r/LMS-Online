import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import ErrorHandler from '../Utils/ErrorHnadler';
import User from '../Models/UserModal';
import jwt, { Secret } from 'jsonwebtoken';
import { SendMail } from '../Utils/SendMail';
import { clrearCookies, setCookies } from '../Utils/UserUtils';

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
            template: 'mail-code.ejs',
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

// activation user
interface activationBodyInterface {
    activationToken: string;
    token: string;
}
export const activationUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activationToken, token } = req.body as activationBodyInterface;
        if (!activationToken || !token) {
            return next(new ErrorHandler(400, 'Please provide activation token and JWT token'));
        }
        const decoded: { user: bodyInterface; activationToken: string } = jwt.verify(token as string, process.env.JWT_SECRET as Secret) as { user: bodyInterface; activationToken: string };
        if (decoded.activationToken !== activationToken) {
            return next(new ErrorHandler(400, 'Invalid OTP'));
        }
        const user = await User.findOne({ email: decoded.user.email });
        if (user) {
            return next(new ErrorHandler(404, 'User already exists with this email'));
        }
        await User.create({
            ...decoded.user,
        });
        try {
            const mailOptions = {
                user: decoded.user.email,
                subject: 'Account Activated',
                template: 'Activation.ejs',
                data: { user: { name: decoded.user.name } },
            };
            await SendMail(mailOptions);
            res.status(201).json({
                success: true,
                message: 'Account activated successfully',
            });
        } catch (error: any) {
            return next(new ErrorHandler(500, 'Error on sending mail'));
        }
    } catch (err: any) {
        next(new ErrorHandler(400, err.message));
    }
});

interface loginBody {
    email: string;
    password: string;
}
export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as loginBody;
        if (!email || !password) {
            return next(new ErrorHandler(400, 'Please provide email and password'));
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new ErrorHandler(401, 'Invalid email or password'));
        }
        const isMatched = await user.comparePassword(password);
        if (!isMatched) {
            return next(new ErrorHandler(400, 'Invalid email or password'));
        }
        setCookies(res, user);
    } catch (error: any) {
        next(new ErrorHandler(400, error.message));
    }
});

export const LogoutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        clrearCookies(res);
    } catch (error: any) {
        next(new ErrorHandler(400, error.message));
    }
});
