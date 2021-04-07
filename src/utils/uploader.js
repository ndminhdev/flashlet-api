import multer from 'multer';
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';

import { CLOUD_NAME, CLOUD_KEY, CLOUD_SECRET } from './secrets';

// multer upload
export const uploader = multer();

// cloudinary configurations
cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_KEY,
  api_secret: CLOUD_SECRET,
});

/**
 * Upload file to cloudinary via stream
 */
const streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'flashlet/profiles',
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

export default streamUpload;
