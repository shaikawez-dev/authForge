import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = `${process.env.MONGODB_URI}/${DB_NAME}`;
    const { connection } = await mongoose.connect(mongoURI);
    console.log(`\n ✔ MongoDB Connected Successfully!!`);
    console.log(`📌 HOST: ${connection.host}`);
    console.log(`📌 DATABASE: ${connection.name}`);
    console.log(`📌 PORT: ${connection.name}`);
    console.log(`📌 READYSTATE: ${connection.readyState}`);
  } catch (error) {
    console.log("❌ MongoDB Connection Error: ", error.message);
    process.exit(1);
  }
};

export { connectDB };
