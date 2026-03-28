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
import { generateOTP, storeOTP } from "../utils/otp.js";
import { verifyOTP } from "../utils/verifyotp.js";
import { redisClient } from "../config/redis.js";

dotenv.config();

const options = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};

const generateAccessAndRefreshToken = async (user) => {
  try {
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
  const { fullName, username, email, password } = req.body;
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
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const verificationUrl = `${baseUrl}/api/v1/auth/verify-email/${token}`;
  const html = verifyEmailTemplate(createdUser.fullName, verificationUrl);
  await sendEmail(createdUser.email, "Verify your Email", html);

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const identifier = `${email}_${req.ip}`;
  const key = `login_fail:${identifier}`;

  let attempts = 0;

  try {
    attempts = parseInt(await redisClient.get(key)) || 0;
  } catch (err) {
    console.error("Redis GET error:", err);
  }

  if (attempts >= 5) {
    throw new ApiError(429, "Too many failed attempts");
  }
  const existingUser = await User.findOne({ email });
  if (!existingUser || !existingUser.isEmailVerified) {
    throw new ApiError(401, "Invalid Credentials");
  }
  const isPasswordCorrect = await existingUser.isPasswordValid(password);
  if (!isPasswordCorrect) {
    try {
      const newAttempts = await redisClient.incr(key);
      if (newAttempts === 1) {
        await redisClient.expire(key, 900);
      }
    } catch (err) {
      console.error("Redis INCR error:", err);
    }
    throw new ApiError(401, "Invalid credentials");
  }
  await redisClient.del(key);
  console.log("Redis status:", redisClient.isOpen);
  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(existingUser);
  const loggedUser = await User.findById(existingUser._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedUser, "user login successful"));
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
  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token refreshed successfully"
      )
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
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
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "user with email does not exists");
  }
  const otp = generateOTP();
  await storeOTP(email, otp);
  const html = resetPasswordTemplate(user.fullName, otp);
  await sendEmail(user.email, "Password Reset OTP", html);
  return res.status(200).json(new ApiResponse(200, {}, "otp sent to email"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const validOTP = await verifyOTP(email, otp);
  if (!validOTP) {
    throw new ApiError(401, "Invalid OTP");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid Credentials");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    throw new ApiError(400, "Google token is required");
  }
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload.email_verified) {
    throw new ApiError(400, "Google email not verified");
  }
  const { email, name, picture, sub: googleId } = payload;
  let user = await User.findOne({ email });
  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.isEmailVerified = true;
      await user.save({ validateBeforeSave: false });
    }
  } else {
    user = await User.create({
      email,
      fullName: name,
      username: email.split("@")[0] + Date.now(),
      avatar: picture,
      googleId,
      isEmailVerified: true,
    });
  }
  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { accessToken }, "user logged in successfully"));
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
