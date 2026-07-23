import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadToCloudinary = (buffer, folder = "products") => {

    return new Promise((resolve, reject) => {

        //  upload stream,  preparing Cloudinary to receive data.
        const stream = cloudinary.uploader.upload_stream( { folder  },

            (error, result) => {

                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(stream); // uploads the image
    });

};

export default uploadToCloudinary;