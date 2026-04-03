import { app } from './app';
import { configCloudinary } from './config/cloudinary';
import connectToDB from './config/db';
require('dotenv').config();

connectToDB();
configCloudinary();

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
