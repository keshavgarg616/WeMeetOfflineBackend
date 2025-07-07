import dotenv from "dotenv";
import mongoose from "mongoose";
import isEmail from "validator/lib/isEmail.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
dotenv.config();

const SALT_WORK_FACTOR = parseInt(process.env.SALT_WORK_FACTOR);
const EMAIL_HASH_SECRET = process.env.EMAIL_HASH_SECRET;

function hashEmail(email) {
	return crypto
		.createHmac("sha256", EMAIL_HASH_SECRET)
		.update(email)
		.digest("hex");
}

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
	},
	authCode: {
		type: String,
		required: true,
	},
	authCodeCreatedAt: {
		type: Date,
		default: Date.now,
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	pfp: {
		type: String,
		default:
			"https://icrier.org/wp-content/uploads/2022/09/Event-Image-Not-Found.jpg",
	},
});

userSchema.pre("save", async function (next) {
	try {
		if (this.isModified("email") && isEmail(this.email)) {
			const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
			this.password = await bcrypt.hash(this.password, salt);
			this.email = hashEmail(this.email);
		}
		next();
	} catch (err) {
		next(err);
	}
});

const User = mongoose.model("User", userSchema);
export default User;
