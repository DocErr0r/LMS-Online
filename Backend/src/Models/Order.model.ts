import mongoose, { Document, ObjectId } from 'mongoose';

interface IOrder extends Document {
    userId: ObjectId;
    courseId: ObjectId;
    paymentInfo: object;
    paymentStatus: string;
}

const orderSchema = new mongoose.Schema<IOrder>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        paymentInfo: {
            type: Object,
            required: true,
        },
    },
    { timestamps: true },
);

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
