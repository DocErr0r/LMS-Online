import mongoose, { Document, model } from 'mongoose';

interface faq extends Document {
    question: string;
    answer: string;
}

interface banner extends Document {
    image: {
        public_id?: string;
        url: string;
    };
    title: string;
    subtitle: string;
}

interface category extends Document {
    title: string;
}

interface Layout extends Document {
    type: string;
    faq: faq[];
    banner: banner;
    category: category[];
}

const faqSchema = new mongoose.Schema<faq>({
    question: { type: String },
    answer: String,
});
const categorySchema = new mongoose.Schema<category>({
    title: { type: String },
});

const LayoutSchema = new mongoose.Schema<Layout>({
    type: { type: String, enum: ['FAQ', 'CATEGORY', 'BANNER'], uppercase: true, required: true },
    faq: [faqSchema],
    category: [categorySchema],
    banner: {
        title: { type: String, required: true },
        subtitle: { type: String, required: true },
        image: {
            public_id: { type: String },
            url: { type: String, required: true },
        },
    },
});

const LayoutModel = model<Layout>('Layout', LayoutSchema);
export default LayoutModel;
