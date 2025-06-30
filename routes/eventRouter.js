import { Router } from "express";
import {
	addEvent,
	deleteEvent,
	getEvents,
	updateEvent,
	registerForEvent,
	unregisterFromEvent,
	getEventByTitle,
	isRegisteredForEvent,
	isOrganizerOfEvent,
	getAddressAndAttendees,
	approveAttendee,
	removeAttendee,
	hasRequestedToAttendEvent,
	addComment,
	addReply,
	getComments,
	getUserId,
	deleteComment,
	deleteReply,
	editComment,
	editReply,
} from "../controllers/eventController.js";
import verifyToken from "../middleware.js";

const eventRouter = Router();

eventRouter.post("/add-event", verifyToken, addEvent);
eventRouter.post("/get-events", verifyToken, getEvents);
eventRouter.post("/delete-event", verifyToken, deleteEvent);
eventRouter.post("/get-event-by-title", verifyToken, getEventByTitle);
eventRouter.post("/update-event", verifyToken, updateEvent);
eventRouter.post("/register-for-event", verifyToken, registerForEvent);
eventRouter.post("/unregister-from-event", verifyToken, unregisterFromEvent);
eventRouter.post("/is-registered-for-event", verifyToken, isRegisteredForEvent);
eventRouter.post("/is-organizer-of-event", verifyToken, isOrganizerOfEvent);
eventRouter.post(
	"/get-address-and-attendees",
	verifyToken,
	getAddressAndAttendees
);
eventRouter.post(
	"/has-requested-to-attend",
	verifyToken,
	hasRequestedToAttendEvent
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

export default eventRouter;
