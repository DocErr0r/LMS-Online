import { ConfigOptions, v2 as cloudinary } from 'cloudinary';

export const configCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    } as ConfigOptions);
  } catch (error) {
    console.log(error, 'error in configuration');
  }
};
export const cloudUploder = cloudinary.uploader;
