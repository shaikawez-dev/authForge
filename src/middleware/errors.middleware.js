import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

const errorHandler = (err, req, res, next) => {
  //   console.log("🔥 Global Error: ", err);

  //custom api errors
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, null, err.message));
  }

  //unknown and unexpected errors

  return res
    .status(500)
    .json(new ApiResponse(500, null, "Internal Server Error"));
};

export { errorHandler };
