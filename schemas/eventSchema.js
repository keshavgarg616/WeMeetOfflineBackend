import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const eventSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		unique: true,
	},
	description: {
		type: String,
		required: true,
	},
	beginsAt: {
		type: Date,
		required: true,
	},
	endsAt: {
		type: Date,
		required: true,
	},
	isVirtual: {
		type: Boolean,
		default: false,
	},
	address: {
		type: String,
		default: "",
	},
	tags: {
		type: [String],
		default: [],
	},
	organizerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	attendeeIds: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	requestedAttendeeIds: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	comments: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
			text: {
				type: String,
				required: true,
			},
			replies: [
				{
					user: {
						type: mongoose.Schema.Types.ObjectId,
						ref: "User",
						required: true,
					},
					text: {
						type: String,
						required: true,
					},
				},
			],
		},
	],
	picture: {
		type: String,
		default:
			"https://icrier.org/wp-content/uploads/2022/09/Event-Image-Not-Found.jpg",
	},
});

eventSchema.pre("save", function (next) {
	if (this.isModified("beginsAt") || this.isModified("endsAt")) {
		if (this.beginsAt >= this.endsAt) {
			return next(new Error("Event end time must be after start time"));
		}
	}
	next();
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
