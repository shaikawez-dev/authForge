import { Router } from "express";

const authRouter = Router();

authRouter.route("/register").post();
authRouter.route("/login").post();

export { authRouter };
