import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import LayoutModel from '../Models/Layout.model';
import ErrorHandler from '../Utils/ErrorHnadler';

// creat layout according to type
export const createLayout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        const exist = await LayoutModel.findOne({ type });
        if (exist) {
            return next(new ErrorHandler(`${type} already exist`, 400));
        }
        if (type === 'Banner') {
            const { image, title, subtitle } = req.body;
            // cloud upload
            const banner = {
                image: {
                    public_id: image.public_id,
                    url: image.url,
                },
                title,
                subtitle,
            };
            await LayoutModel.create({ type, banner });
        } else if (type === 'FAQ') {
            const { faq } = req.body;
            await LayoutModel.create({ type, faq });
        } else if (type === 'Category') {
            const { category } = req.body;
            await LayoutModel.create({ type, category });
        } else {
            return next(new ErrorHandler('Please provide valid type of layout', 400));
        }
        res.status(201).json({
            success: true,
            message: 'Layout created successfully',
        });
    } catch (err: any) {
        return next(new ErrorHandler(err, 500));
    }
});

// edit layout
export const editLayout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        if (type === 'Banner') {
            const { image, title, subtitle } = req.body;
            const bannerData: any = await LayoutModel.findOne({ type });
            if (bannerData) {
                // destory image
            }
            // cloud upload new image
            const banner = {
                image: {
                    public_id: image.public_id,
                    url: image.url,
                },
                title,
                subtitle,
            };
            await LayoutModel.findByIdAndUpdate(bannerData._id, { banner });
        } else if (type === 'FAQ') {
            const faqData: any = await LayoutModel.findOne({ type });
            const { faq } = req.body;
            await LayoutModel.findByIdAndUpdate(faqData?._id, { faq });
        } else if (type === 'Category') {
            const categoryData: any = await LayoutModel.findOne({ type });
            const { category } = req.body;
            await LayoutModel.findByIdAndUpdate(categoryData?._id, { category });
        } else {
            return next(new ErrorHandler('Please provide valid type of layout', 400));
        }
        res.status(201).json({
            success: true,
            message: `Layout ${type} updated successfully`,
        });
    } catch (err: any) {
        return next(new ErrorHandler(err, 500));
    }
});

// get layout by type
export const getLayoutbyType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        if (!type) {
            return next(new ErrorHandler('Please provide valid type of layout', 400));
        }
        const layout = await LayoutModel.findOne({ type });
        if (!layout) {
            return next(new ErrorHandler(`Type ${type} layout not found`, 404));
        }
        res.status(201).json({
            success: true,
            LayoutData: layout,
        });
    } catch (err: any) {
        return next(new ErrorHandler(err, 500));
    }
});
