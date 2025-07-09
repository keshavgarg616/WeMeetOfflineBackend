import { Router } from "express";
import {
	addEvent,
	deleteEvent,
	updateEvent,
	registerForEvent,
	unregisterFromEvent,
	getEventByTitle,
	getAddressAndAttendees,
	approveAttendee,
	removeAttendee,
	addComment,
	addReply,
	getComments,
	getUserId,
	deleteComment,
	deleteReply,
	editComment,
	editReply,
	searchEvents,
	getUserStatus,
} from "../controllers/eventController.js";
import { checkIfPhoneVerified, verifyToken } from "../middleware.js";

const eventRouter = Router();

eventRouter.post("/add-event", verifyToken, addEvent);
eventRouter.post("/delete-event", verifyToken, deleteEvent);
eventRouter.post("/get-event-by-title", verifyToken, getEventByTitle);
eventRouter.post("/update-event", verifyToken, updateEvent);
eventRouter.post(
	"/register-for-event",
	verifyToken,
	checkIfPhoneVerified,
	registerForEvent
);
eventRouter.post("/unregister-from-event", verifyToken, unregisterFromEvent);
eventRouter.post("/get-user-status", verifyToken, getUserStatus);
eventRouter.post(
	"/get-address-and-attendees",
	verifyToken,
	getAddressAndAttendees
);
eventRouter.post("/approve-attendee", verifyToken, approveAttendee);
eventRouter.post("/remove-attendee", verifyToken, removeAttendee);
eventRouter.post("/add-comment", verifyToken, addComment);
eventRouter.post("/add-reply", verifyToken, addReply);
eventRouter.post("/get-comments", verifyToken, getComments);
eventRouter.post("/get-userid", verifyToken, getUserId);
eventRouter.post("/delete-comment", verifyToken, deleteComment);
eventRouter.post("/delete-reply", verifyToken, deleteReply);
eventRouter.post("/edit-comment", verifyToken, editComment);
eventRouter.post("/edit-reply", verifyToken, editReply);
eventRouter.post("/search-events", verifyToken, searchEvents);

export default eventRouter;
