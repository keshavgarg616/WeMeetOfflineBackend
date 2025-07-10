import dotenv from "dotenv";
import User from "../schemas/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import crypto from "crypto";
import nodemailer from "nodemailer";
import admin from "firebase-admin";
import Event from "../schemas/eventSchema.js";
import twilio from "twilio";

dotenv.config();
admin.initializeApp({
	credential: admin.credential.cert({
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
	}),
});

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SMTP_HOST,
	port: process.env.EMAIL_SMTP_PORT,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.EMAIL_USER, // your email address
		pass: process.env.EMAIL_PASS, // your email password
	},
});

export const signUp = async (req, res) => {
	const { name, email, password, imgUrl, phone } = req.body;

	const authCode = getAuthCode(email);

	try {
		const existingUser = await findByEmail(email);
		if (existingUser) {
			return res.status(400).json({ error: "User already exists" });
		}

		const newUser = new User({
			name,
			email,
			password,
			authCode,
			pfp: imgUrl,
			isVerified: false,
			phone,
		});
		(async () => {
			const info = await transporter.sendMail({
				from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_USER}>`, // sender address
				to: email,
				subject: "We Meet Offline Sign Up",
				text: `Hi ${name}! You have signed up for We Meet Offline!`,
				html: `<b><p>Hi ${name}!</p></b><p>You have signed up for We Meet Offline!</p><Click on the link below to verify your email address:</p><p><a href="${process.env.FRONTEND_URL}/verify-email?code=${authCode}">Verify Email</a></p>`,
			});
		})();
		await newUser.save();

		res.status(200).json({
			success: true,
			message: "User created successfully",
		});
	} catch (error) {
		console.error("Signup error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await findByEmail(email);
		if (user) {
			const isPasswordValid = await bcrypt.compare(
				password,
				user.password
			);
			if (isPasswordValid) {
				if (!user.isVerified) {
					return res
						.status(403)
						.json({ error: "Email not verified" });
				}
				const token = jwt.sign(
					{ userId: user._id },
					process.env.JWT_SECRET,
					{
						expiresIn: "1h",
					}
				);
				res.status(200).json({ token });
			} else {
				return res.status(401).json({ error: "Invalid password" });
			}
		} else {
			return res.status(400).json({ error: "User not found" });
		}
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const firebaseLogin = async (req, res) => {
	const { idToken } = req.body;

	try {
		const decoded = await admin.auth().verifyIdToken(idToken);
		const { email, name } = decoded;
		if (decoded) {
			let user = await findByEmail(email);
			if (!user) {
				const randomPswd = randomBytes(16).toString("hex");
				const newUser = new User({
					name: name,
					email: email,
					authCode: getAuthCode(email),
					isVerified: true,
					pfp: decoded.picture,
					password: randomPswd,
				});
				await newUser.save();
				user = newUser;
				await transporter.sendMail({
					from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_USER}>`, // sender address
					to: email,
					subject: "We Meet Offline Sign Up",
					text: `Hi ${name}! You have signed up for We Meet Offline!`,
					html: `<b><p>Hi ${name}!</p></b><p>You have signed up for We Meet Offline!</p>
					<p>Your current password is: ${randomPswd}</p>
					<p>Click on the link below to set a password:</p>
					<p>
						<a href="${process.env.FRONTEND_URL}/forgot-password">Set Password</a>
					</p>`,
				});
			}
			if (!user.isVerified) {
				return res.status(403).json({ error: "Email not verified" });
			}
			const token = jwt.sign(
				{ userId: user._id },
				process.env.JWT_SECRET,
				{
					expiresIn: "1h",
				}
			);
			res.status(200).json({ token });
		} else {
			return res.status(403).json({ error: "Email not verified" });
		}
	} catch (err) {
		res.status(401).json({ error: "Invalid token" });
	}
};

export const verifyEmailCode = async (req, res) => {
	const { authCode } = req.body;

	const email = getEmailFromAuthCode(authCode);
	if (!email || email === "Invalid auth code") {
		return res.status(400).json({ error: "Invalid auth code" });
	}

	try {
		const user = await findByEmail(email);
		if (user) {
			if (user.isVerified) {
				return res
					.status(400)
					.json({ error: "Email already verified" });
			}
			if (user.authCode === authCode) {
				user.isVerified = true;
				await user.save();
				return res
					.status(200)
					.json({ message: "Email verified successfully" });
			} else {
				return res.status(400).json({ error: "Invalid auth code" });
			}
		} else {
			return res.status(400).json({ error: "Invalid auth code" });
		}
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Verification error:", error);
	}
};

export const resetPassword = async (req, res) => {
	const { authCode, password } = req.body;

	const email = getEmailFromAuthCode(authCode);
	if (!email || email === "Invalid auth code") {
		return res.status(400).json({ error: "Invalid auth code" });
	}

	try {
		const user = await findByEmail(email);
		if (user) {
			if (Date.now() - user.authCodeCreatedAt > 1 * 60 * 1000) {
				return res.status(401).json({
					error: "Auth code expired",
				});
			}
			if (user.authCode === authCode) {
				const salt = await bcrypt.genSalt(
					parseInt(process.env.SALT_WORK_FACTOR)
				);
				user.password = await bcrypt.hash(password, salt);
				await user.save();
				return res
					.status(200)
					.json({ message: "Password Reset Successfully" });
			} else {
				return res.status(400).json({ error: "Invalid auth code" });
			}
		} else {
			return res.status(400).json({ error: "Invalid auth code" });
		}
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Verification error:", error);
	}
};

export const requestPasswordReset = async (req, res) => {
	const { email } = req.body;

	try {
		const user = await findByEmail(email);
		if (!user) {
			return res.status(400).json({ error: "Email not registered." });
		}
		let authCode = user.authCode;
		if (Date.now() - user.authCodeCreatedAt > 1 * 60 * 1000) {
			authCode = getAuthCode(email);
			user.authCode = authCode;
			user.authCodeCreatedAt = Date.now();
		}
		await user.save();

		await transporter.sendMail({
			from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_USER}>`, // sender address
			to: email,
			subject: "We Meet Offline Password Reset",
			text: `Hi ${user.name}! You have requested a password reset for We Meet Offline.`,
			html: `<b><p>Hi ${user.name}!</p></b><p>You have requested a password reset for We Meet Offline.</p><Click on the link below to reset your password:</p><p><a href="${process.env.FRONTEND_URL}/reset-password?code=${authCode}">Reset Password</a></p>`,
		});

		res.status(200).json({
			success: true,
			message: "Password reset request successful",
		});
	} catch (error) {
		console.error("Password reset request error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const updateUserProfile = async (req, res) => {
	const { name, pfp } = req.body;
	const userId = req.userId;
	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}
		user.name = name;
		user.pfp = pfp;
		await user.save();
		res.status(200).json({ success: true });
	} catch (error) {
		console.error("Error updating user profile:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserProfile = async (req, res) => {
	const userId = req.userId;
	try {
		const user = await User.findById(userId).select(
			"name pfp phone authCode isPhoneVerified"
		);
		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}
		const email = getEmailFromAuthCode(user.authCode);
		const eventsRegistered = (await Event.find())
			.filter((event) => event.attendeeIds.includes(userId))
			.map((event) => ({
				_id: event._id,
				name: event.title,
				picture: event.picture,
			}));
		const eventsCreated = (await Event.find())
			.filter((event) => event.organizerId.equals(userId))
			.map((event) => ({
				_id: event._id,
				name: event.title,
				picture: event.picture,
			}));
		const eventsRequestedToJoin = (await Event.find())
			.filter((event) => event.requestedAttendeeIds.includes(userId))
			.map((event) => ({
				_id: event._id,
				name: event.title,
				picture: event.picture,
			}));
		res.status(200).json({
			name: user.name,
			pfp: user.pfp,
			phone: user.phone,
			isPhoneVerified: user.isPhoneVerified,
			email,
			eventsCreated,
			eventsRegistered,
			eventsRequestedToJoin,
		});
	} catch (error) {
		console.error("Error fetching user profile:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const requestOTP = async (req, res) => {
	const userId = req.userId;

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}
		if (user.isPhoneVerified) {
			return res.status(400).json({ error: "Phone already verified" });
		}

		const phone = user.phone;
		const otp = Math.floor(Math.random() * 1000000);
		user.phoneOTP = otp;
		await user.save();

		const client = twilio(
			process.env.TWILIO_ACCOUNT_SID,
			process.env.TWILIO_AUTH_TOKEN
		);
		await client.messages.create({
			body: `Your OTP for We Meet Offline is ${otp}`,
			from: process.env.TWILIO_PHONE_NUMBER,
			to: phone,
		});

		res.status(200).json({
			success: true,
			message: "OTP sent successfully",
		});
	} catch (error) {
		console.error("Error requesting OTP:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const verifyOTP = async (req, res) => {
	const { otp } = req.body;
	const userId = req.userId;

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}
		if (user.isPhoneVerified) {
			return res.status(400).json({ error: "Phone already verified" });
		}
		if (user.phoneOTP === otp) {
			user.isPhoneVerified = true;
			user.phoneOTP = "";
			await user.save();
			res.status(200).json({
				success: true,
				message: "Phone verified successfully",
			});
		} else {
			res.status(400).json({ error: "Invalid OTP" });
		}
	} catch (error) {
		console.error("Error verifying OTP:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

async function findByEmail(plainEmail) {
	const hashedEmail = crypto
		.createHmac("sha256", process.env.EMAIL_HASH_SECRET)
		.update(plainEmail)
		.digest("hex");
	return User.findOne({ email: hashedEmail });
}

function getAuthCode(email) {
	const cipher = crypto.createCipheriv(
		process.env.ENCRYPTION_ALGORITHM,
		Buffer.from(process.env.ENCRYPTION_KEY, "hex"),
		Buffer.from(process.env.ENCRYPTION_IV, "hex")
	);
	let encrypted = cipher.update(
		email + " " + randomBytes(16).toString("hex"),
		"utf8",
		"hex"
	);
	encrypted += cipher.final("hex");
	return encrypted;
}

function getEmailFromAuthCode(authCode) {
	const decipher = crypto.createDecipheriv(
		process.env.ENCRYPTION_ALGORITHM,
		Buffer.from(process.env.ENCRYPTION_KEY, "hex"),
		Buffer.from(process.env.ENCRYPTION_IV, "hex")
	);
	let decrypted = "";
	try {
		decrypted = decipher.update(authCode, "hex", "utf8");
		decrypted += decipher.final("utf8");
	} catch (error) {
		console.error("Decryption error");
		return "Invalid auth code";
	}
	return decrypted.split(" ")[0];
}
