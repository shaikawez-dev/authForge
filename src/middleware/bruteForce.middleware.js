// middleware/bruteForce.middleware.js
import { redisClient } from "../config/redis.js";
import { ApiError } from "../utils/apiError.js";

export const bruteForceProtection = async (req, res, next) => {
  const identifier = req.body.email || req.ip;
  const key = `login_fail:${identifier}`;

  const attempts = await redisClient.get(key);

  if (attempts && Number(attempts) >= 5) {
    throw new ApiError(
      403,
      "Too many failed attempts. Try again after 15 minutes"
    );
  }

  next();
};
