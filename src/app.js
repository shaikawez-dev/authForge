import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "../src/middleware/errors.middleware.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

dotenv.config();

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(
  urlencoded({
    limit: "16kb",
    extended: true,
  })
);
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "16kb",
  })
);

// routes middleware
import { authRouter } from "../src/routes/auth.routes.js";
app.use("/api/v1/auth", authRouter);

app.use(errorHandler);
export { app };
