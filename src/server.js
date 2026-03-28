import { app } from "./app.js";
import { connectDB } from "../src/config/db.js";
import { connectRedis } from "./config/redis.js";
import dotenv from "dotenv";

dotenv.config();

connectDB()
  .then(async () => {
    await connectRedis();
    app.listen(process.env.PORT || 4000, () => {
      console.log(`⚙️ Server is running at PORT: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed!! ", error.message);
  });
