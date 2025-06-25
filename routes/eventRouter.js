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

export default eventRouter;
