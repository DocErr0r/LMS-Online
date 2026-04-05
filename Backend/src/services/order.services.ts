import { NextFunction, Response } from 'express';
import crypto from 'crypto';

interface paymentInfo {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    amount?: number;
}
export const getExpactedSign = async (paymentInfo: paymentInfo, res: Response, next: NextFunction) => {
    const sign = paymentInfo.razorpay_order_id + '|' + paymentInfo.razorpay_payment_id;
    const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
        .update(sign.toString())
        .digest('hex');

    return expectedSign;
};
