import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './UserModal';

interface INotification extends Document {
    title: string;
    user: mongoose.Types.ObjectId | IUser;
    message: string;
    status: string;
}

const notificataionSchema = new Schema<INotification>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, required: true },
        title: { type: String, required: true },
        status: { type: String, default: 'unread' },
    },
    {
        timestamps: true,
    },
);

const Notification = mongoose.model<INotification>('Notification', notificataionSchema);
export default Notification;