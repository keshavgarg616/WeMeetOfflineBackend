import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
	{
		origin: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
		autoIndex: true,
		usePushEach: true,
		expireAfterSeconds: 60 * 60 * 24 * 15,
	}
);

const Log = mongoose.model("Log", logSchema);
export default Log;
