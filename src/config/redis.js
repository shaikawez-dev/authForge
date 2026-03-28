import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis connected");
  } catch (error) {
    console.error("Redis connection failed:", error);
  }
};
