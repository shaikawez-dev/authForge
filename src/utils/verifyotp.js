import { redisClient } from "../config/redis.js";
import crypto from "crypto";

export const verifyOTP = async (email, otp) => {
  const key = `otp:${email}`;
  
  const stored = await redisClient.get(key);

  if (!stored) {
    throw new Error("OTP expired");
  }
  console.log("stored otp got from redis");
  
  const hashedInput = crypto.createHash("sha256").update(otp).digest("hex");

  if (stored !== hashedInput) {
    return false;
  }

  await redisClient.del(key); // one-time use

  return true;
};
