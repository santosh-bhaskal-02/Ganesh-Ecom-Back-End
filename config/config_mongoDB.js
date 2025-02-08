const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection string
const uri = process.env.MONGO_URI;

const connectMongo = async () => {
  try {
    const response = await mongoose.connect(uri, {
      dbName: "ganeshIdols",
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected Successfully...!");
  } catch (err) {
    console.log("error :", err);
  }
};

module.exports = connectMongo;
