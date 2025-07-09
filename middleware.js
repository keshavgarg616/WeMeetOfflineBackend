import configDotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "./schemas/userSchema.js";

configDotenv.config();

export function verifyToken(req, res, next) {
	const token = req.header("Authorization");
	if (!token) return res.status(401).json({ error: "Access denied" });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decoded.userId;
		next();
	} catch (error) {
		res.status(401).json({ error: "Invalid token" });
	}
}

export function checkIfPhoneVerified(req, res, next) {
	const userId = req.userId;
	if (!userId) return res.status(401).json({ error: "Unauthorized" });

	User.findById(userId)
		.select("isPhoneVerified")
		.then((user) => {
			if (!user) return res.status(400).json({ error: "User not found" });
			if (user.isPhoneVerified) {
				next();
			} else {
				res.status(403).json({ error: "Phone number not verified" });
			}
		})
		.catch((error) => res.status(500).json({ error: "Server error" }));
}
