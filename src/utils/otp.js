import { redisClient } from "../config/redis.js";
import crypto from "crypto";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = async (email, otp) => {
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  const key = `otp:${email}`;

  await redisClient.set(key, hashedOTP, {
    EX: 300, // 5 mins
  });
};
