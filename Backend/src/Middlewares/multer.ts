import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import ErrorHandler from '../Utils/ErrorHnadler';

const storage = multer.memoryStorage();
export const uploadSingle = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('image');

export const uploadMultiple = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
}).array('images', 5); // 5 images at a time

interface ProcessedFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
}
declare module 'express-serve-static-core' {
    interface Request {
        processedFiles?: ProcessedFile[];
        processedFile?: ProcessedFile;
    }
}

// Middleware to process image with Sharp
export const processImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = (req.file ? [req.file] : req.files) as Express.Multer.File[] | undefined;

        // limit size single or multiple 5mb

        if (!files || files.length === 0) return next(); // No file, skip

        const processedFiles: ProcessedFile[] = await Promise.all(
            files.map(async (file) => {
                // Reject non-image files if not handled in multer filter
                if (!file.mimetype.startsWith('image/')) {
                    throw new ErrorHandler('Only images are allowed', 400);
                }

                const processedBuffer = await sharp(file.buffer)
                    .resize(800, null, { withoutEnlargement: true }) // Don't upskill small images
                    .webp({ quality: 70 })
                    .toBuffer();

                return {
                    buffer: processedBuffer,
                    originalname: `${file.originalname.split('.')[0]}.webp`,
                    mimetype: 'image/webp',
                };
            }),
        );

        // Attach to request object
        if (req.file) {
            req.processedFile = processedFiles[0];
        } else {
            req.processedFiles = processedFiles;
        }

        next();
    } catch (err) {
        console.error('Image processing error:', err);
        next(new ErrorHandler(err, 400));
    }
};
