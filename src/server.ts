import { app } from './app';
import connectToDB from './config/db';
require('dotenv').config();

connectToDB();

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
