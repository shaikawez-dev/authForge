import { ApiError } from "../utils/apiError.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const formattedErrors = result.error.issues.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));

    throw new ApiError(400, formattedErrors);
  }
  req.body = result.data;

  next();
};
