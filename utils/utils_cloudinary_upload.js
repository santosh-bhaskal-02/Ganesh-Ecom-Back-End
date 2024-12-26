const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const uploadtoCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "product" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            img_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const deletetoCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve({
          suceess: true,
          message: result,
        });
      }
    });
  });
};

//module.exports =  deletetoCloudinary;
module.exports =  uploadtoCloudinary;