import { Router } from "express";
import {
	login,
	signUp,
	verifyEmailCode,
	resetPassword,
	requestPasswordReset,
	setPfp,
	getUserProfile,
} from "../controllers/userController.js";
import verifyToken from "../middleware.js";
const userRouter = Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", login);
userRouter.post("/verify-email-code", verifyEmailCode);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/request-password-reset", requestPasswordReset);
userRouter.post("/set-pfp", verifyToken, setPfp);
userRouter.post("/get-user-profile", verifyToken, getUserProfile);

export default userRouter;
