import { redisClient } from "../config/redis.js";
import { ApiError } from "../utils/apiError.js";

export const rateLimit = ({ limit = 5, window = 60 }) => {
  return async (req, res, next) => {
    try {
      const ip = req.ip;
      const key = `rate:${ip}:${req.path}`;

      const current = await redisClient.incr(key);

      if (current === 1) {
        await redisClient.expire(key, window);
      }

      if (current > limit) {
        throw new ApiError(
          429,
          `Too many requests. Try again after ${window} seconds`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
