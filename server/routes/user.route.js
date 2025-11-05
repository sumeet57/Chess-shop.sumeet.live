import express from "express";
import {
  getUserProfile,
  loginUser,
  registerUser,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const userRouter = express.Router();

userRouter.get("/user", authenticate, getUserProfile);
userRouter.post("/user/login", loginUser);
userRouter.post("/user/register", registerUser);

export default userRouter;
