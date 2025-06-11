import mongoose, { ConnectOptions } from 'mongoose';

const connectToDB = async () => {
    const url = process.env.MONGO_URI || '';
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as ConnectOptions);
        console.log('Connected to MongoDB');
    } catch (err: any) {
        console.log(err);
        setTimeout(connectToDB, 5000);
    }
};
export default connectToDB;
