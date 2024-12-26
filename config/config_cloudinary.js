const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const cloudName = process.env.CLOUD_NAME;
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

const connectCloudinary = async () => {
  try {
    const response = await cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    console.log("Cloudinary Connected Successfully...!");
  } catch (error) {
    console.log("Error :", error);
  }
};

module.exports = connectCloudinary;