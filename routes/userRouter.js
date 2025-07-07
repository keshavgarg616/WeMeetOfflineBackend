import { Router } from "express";
import {
	login,
	signUp,
	verifyEmailCode,
	resetPassword,
	requestPasswordReset,
	updateUserProfile,
	getUserProfile,
	googleLogin,
} from "../controllers/userController.js";
import verifyToken from "../middleware.js";
const userRouter = Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", login);
userRouter.post("/verify-email-code", verifyEmailCode);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/request-password-reset", requestPasswordReset);
userRouter.post("/update-user-profile", verifyToken, updateUserProfile);
userRouter.post("/get-user-profile", verifyToken, getUserProfile);
userRouter.post("/google-login", googleLogin);

export default userRouter;
