import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleLogin,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.route("/register").post(register);
authRouter.route("/login").post(login);
authRouter.route("/logout").post(verifyJWT, logout);
authRouter.route("/refresh-token").post(refreshToken);
authRouter.route("/google").post(googleLogin);
authRouter.route("/reset-password").post(resetPassword);
authRouter.route("/forgot-password").post(forgotPassword);
authRouter.route("/verify-email/:token").get(verifyEmail);

export { authRouter };
