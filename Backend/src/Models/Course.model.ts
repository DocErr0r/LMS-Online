import mongoose, { Document, ObjectId } from 'mongoose';

interface IComment extends Document {
    user: object;
    comment: string;
    replies?: IComment[];
}
interface ILink extends Document {
    title: string;
    url: string;
}
interface IReview extends Document {
    user: object;
    comment: string;
    rating: number;
    replies: IComment[];
}
interface ICourseData extends Document {
    title: string;
    description: string;
    links: ILink[];
    questions: IComment[];
    videoUrl: string;
    videoThumbnail: object;
    videoSection: string;
    videoLength: string;
    videoPlayer: string;
    suggestions: string[];
}
interface ICourse extends Document {
    name: string;
    description: string;
    price: number;
    estimatedPrice?: number;
    thumbnail: object;
    tags: string;
    level: string;
    demoUrl: string;
    courseData: ICourseData;
    reviews: IReview[];
    rating: number;
    benefits: string[];
    prerequisites: string[];
    purchased?: number;
}

const LinkSchema = new mongoose.Schema<ILink>({
    title: String,
    url: String,
});
const CommentSchema = new mongoose.Schema<IComment>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
});
const ReviewSchema = new mongoose.Schema<IReview>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, default: 0 },
    replies: [CommentSchema],
    comment: String,
});
const CourseDataSchema = new mongoose.Schema<ICourseData>({
    title: String,
    description: String,
    links: [LinkSchema],
    questions: [CommentSchema],
    videoUrl: String,
    videoThumbnail: Object,
    videoSection: String,
    videoLength: String,
    videoPlayer: String,
    suggestions: [String],
});
const CourseSchema = new mongoose.Schema<ICourse>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        estimatedPrice: { type: Number },
        thumbnail: { public_id: { type: String, required: true }, url: { type: String, required: true } },
        tags: { type: String, required: true },
        level: { type: String, required: true },
        demoUrl: { type: String, required: true },
        courseData: [CourseDataSchema],
        reviews: [ReviewSchema],
        rating: { type: Number, default: 0 },
        benefits: { type: [String] },
        prerequisites: { type: [String] },
        purchased: { type: Number, default: 0 },
    },
    { timestamps: true },
);
export const Course = mongoose.model<ICourse>('Course', CourseSchema);