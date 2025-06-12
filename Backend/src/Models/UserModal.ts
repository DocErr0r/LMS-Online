import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    };
    role: string;
    isverified: boolean;
    courses: Array<{ courseId: string }>;
    comparePassword: (password: string) => Promise<boolean>;
}

var userSchema: Schema<IUser> = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Please enter your name'] },
        email: {
            type: String,
            required: [true, 'Please enter your email'],
            unique: true, 
            validate: {
                validator: function (v: string) {
                    const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                    return emailRegex.test(v);
                },
                message: 'please enter a valid email',
            },
        },
        password: {
            type: String,
            required: [true, 'Please enter your password'],
            minlength: [6, 'Your password must be longer than 6 characters'],
            select: false,
        },
        avatar: {
            public_id: String,
            url: String,
        },
        role: {
            type: String,
            default: 'user',
        },
        isverified: {
            type: Boolean,
            default: false,
        },
        courses: [
            {
                courseId: String,
            },
        ],
    },
    { timestamps: true },
);

// hash password before saving user
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
// campare user password
userSchema.methods.comparePassword = async function (userPassword: string): Promise<boolean> {
    return await bcrypt.compare(userPassword, this.password);
};

const User: Model<IUser> = mongoose.model('User', userSchema);
export default User;
