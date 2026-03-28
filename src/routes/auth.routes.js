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
import {
  loginSchema,
  registerUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/zod.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { rateLimit } from "../middleware/ratelimit.middleware.js";
import { bruteForceProtection } from "../middleware/bruteForce.middleware.js";

const authRouter = Router();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Awez
 *               email:
 *                 type: string
 *                 example: awez@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
authRouter
  .route("/register")
  .post(
    validate(registerUserSchema),
    rateLimit({ limit: 3, window: 60 }),
    register
  );
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: awez@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
authRouter
  .route("/login")
  .post(
    validate(loginSchema),
    rateLimit({ limit: 5, window: 60 }),
    bruteForceProtection,
    login
  );
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
authRouter.route("/logout").post(verifyJWT, logout);
authRouter.route("/refresh-token").post(refreshToken);
authRouter.route("/google").post(googleLogin);
/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Password reset successful
 */
authRouter
  .route("/reset-password")
  .post(validate(resetPasswordSchema), resetPassword);
authRouter
  .route("/forgot-password")
  .post(
    rateLimit({ limit: 3, window: 300 }),
    validate(forgotPasswordSchema),
    forgotPassword
  );
/**
 * @swagger
 * /auth/verify-email/{token}:
 *   get:
 *     summary: Verify user email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified
 */
authRouter.route("/verify-email/:token").get(verifyEmail);

export { authRouter };
