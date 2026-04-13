import { app } from './app';
import { configCloudinary } from './config/cloudinary';
import connectToDB from './config/db';
require('dotenv').config();

connectToDB();
configCloudinary();

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
