import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const { MONGODB_URI } = process.env;
    if (!MONGODB_URI || typeof MONGODB_URI !== "string" || MONGODB_URI.trim() === "") {
      throw new Error("Missing environment variable MONGODB_URI");
    }
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
