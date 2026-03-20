import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { User } from "../models/auth.model.js";
import crypto from "crypto";
import { resetPasswordTemplate } from "../templates/resetPassword.js";
import { verifyEmailTemplate } from "../templates/verifyEmail.js";
import { sendEmail } from "../utils/sendEmail.js";
import { client } from "../utils/googleClient.js";

dotenv.config();

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(
      "Error occured while generating the access and refresh tokens ",
      error.message
    );
  }
};

const register = asyncHandler(async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    if (
      [fullName, username, email, password].some((fields) => {
        return fields.trim() === "";
      })
    ) {
      throw new ApiError(400, "All fields are required");
    }
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      throw new ApiError(400, "user with email or username already exists");
    }
    // send email for verification
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.create({
      username,
      fullName,
      email,
      password,
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: Date.now() + 1000 * 60 * 60,
    });
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }
    const verificationUrl = `http://localhost:5000/api/v1/users/verify-email/${token}`;
    const html = verifyEmailTemplate(createdUser.fullName, verificationUrl);
    await sendEmail(createdUser.email, "Verify your Email", html);

    return res
      .status(200)
      .json(new ApiResponse(200, createdUser, "user registered successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while registering the user"
    );
  }
});

const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "email and password is required");
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new ApiError(400, "email doesn't exists");
    }
    const isPasswordCorrect = await existingUser.isPasswordValid(password);
    if (!isPasswordCorrect) {
      throw new ApiError(400, "password is invalid");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      existingUser._id
    );
    const loggedUser = await User.findById(existingUser._id).select(
      "-password -refreshToken"
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, loggedUser, "user login successful"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error occured while logging in");
  }
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "user logged out"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(400, "unauthorized request");
  }
  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(400, "Invalid refresh Token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(400, "Refresh Token is expired or used");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user?._id
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, error.message || "Invalid refresh Token");
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: { $gt: Date.now() },
    });
    if (!user) {
      throw new ApiError(400, "Token is invalid or expired");
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Email verified successfully"));
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, "email is required");
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, "user with email does not exists");
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    user.resetPasswordOtp = hashedOTP;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const html = resetPasswordTemplate(user.fullName, otp);
    await sendEmail(user.email, "Password Reset OTP", html);
    return res.status(200).json(new ApiResponse(200, {}, "otp sent to email"));
  } catch (error) {
    throw new ApiError(400, error?.message || "Email does not exists");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    const user = await User.findOne({
      email,
      resetPasswordOtp: hashedOTP,
      resetPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
      throw new ApiError(400, "Invalid otp or expired");
    }
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully"));
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid otp");
  }
});

const googleLogin = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        fullName: name,
        avatar: picture,
        isEmailVerified: true,
      });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "user logged in successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid google Token");
  }
});

export {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resetPassword,
  googleLogin,
  forgotPassword,
};
