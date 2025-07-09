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
	requestOTP,
	verifyOTP,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware.js";
const userRouter = Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", login);
userRouter.post("/verify-email-code", verifyEmailCode);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/request-password-reset", requestPasswordReset);
userRouter.post("/update-user-profile", verifyToken, updateUserProfile);
userRouter.post("/get-user-profile", verifyToken, getUserProfile);
userRouter.post("/request-otp", verifyToken, requestOTP);
userRouter.post("/verify-otp", verifyToken, verifyOTP);
userRouter.post("/google-login", googleLogin);
userRouter.get("/", (req, res) => {
	res.status(200).json({
		message: "Hi! This is the backend for We Meet Offline!",
	});
});

export default userRouter;
