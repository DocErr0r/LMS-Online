import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../Utils/AsyncHandler';
import LayoutModel from '../Models/Layout.model';
import ErrorHandler from '../Utils/ErrorHnadler';

interface typeBodyRequest {
    type: string;
}
// creat layout according to type
export const createLayout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body as typeBodyRequest;
        const exist = await LayoutModel.findOne({ type });
        if (exist) {
            return next(new ErrorHandler(`${exist.type} already exist`, 400));
        }
        if (type.toLowerCase() === 'banner') {
            const { image, title, subtitle } = req.body;
            // cloud upload
            const banner = {
                image: {
                    public_id: image?.public_id,
                    url: image.url,
                },
                title,
                subtitle,
            };
            await LayoutModel.create({ type, banner });
        } else if (type.toUpperCase() === 'FAQ') {
            const { faq } = req.body;
            await LayoutModel.create({ type, faq });
        } else if (type.toLowerCase() === 'category') {
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
        console.log(err);
        return next(new ErrorHandler(err, 500));
    }
});

// edit layout
export const editLayout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body as typeBodyRequest;

    const existData: any = await LayoutModel.findOne({ type });
    if (!existData) {
        return next(new ErrorHandler(`${type} not found`, 404));
    }

    let updateData: any = {};

    // BANNER UPDATE
    if (type.toLowerCase() === 'banner') {
        const { image, title, subtitle } = req.body;
        if (image) {
            updateData['banner.image'] = {
                public_id: image?.public_id,
                url: image.url,
            };
        }
        if (title) {
            updateData['banner.title'] = title;
        }
        if (subtitle) {
            updateData['banner.subtitle'] = subtitle;
        }
    }
    // FAQ UPDATE
    else if (type.toLowerCase() === 'faq') {
        const { faq } = req.body;
        if (!faq || !faq.length) {
            return next(new ErrorHandler('FAQ data is required', 400));
        }
        updateData['faq'] = faq;
    }

    // CATEGORY UPDATE
    else if (type.toLowerCase() === 'category') {
        const { category } = req.body;
        if (!category || !category.length) {
            return next(new ErrorHandler('Category data is required', 400));
        }
        updateData['category'] = category;
    }
    // INVALID TYPE
    else {
        return next(new ErrorHandler('Please provide valid type of layout', 400));
    }
    // If nothing to update
    if (Object.keys(updateData).length === 0) {
        return next(new ErrorHandler('No valid fields provided to update', 400));
    }
    const updatedLayout = await LayoutModel.findByIdAndUpdate(existData._id, { $set: updateData }, { new: true });
    res.status(200).json({
        success: true,
        message: `Layout ${type} updated successfully`,
    });
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
