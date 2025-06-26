import Event from "../schemas/eventSchema.js";

export const addEvent = async (req, res) => {
	const {
		title,
		description,
		beginsAt,
		endsAt,
		isVirtual,
		address,
		tags,
		imgUrl,
	} = req.body;

	const userId = req.userId;

	try {
		const existingEvent = await Event.findOne({ title });
		if (existingEvent) {
			return res
				.status(400)
				.json({ error: "Event with this title already exists" });
		}

		const newEvent = new Event({
			title,
			description,
			beginsAt,
			endsAt,
			isVirtual,
			address,
			tags,
			organizerId: userId,
			attendeeIds: [],
			picture: imgUrl,
		});

		await newEvent.save();
		res.status(201).json({
			message: "Event created successfully",
			event: newEvent,
		});
	} catch (error) {
		console.error("Error creating event:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getEvents = async (req, res) => {
	try {
		const events = await Event.find({}, { attendeeIds: 0, address: 0 })
			.populate("organizerId", { name: 1, pfp: 1, _id: 0 })
			.sort({ beginsAt: 1 }); // Sort by beginning time
		res.status(200).json(events);
	} catch (error) {
		console.error("Error fetching events:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const deleteEvent = async (req, res) => {
	const { title } = req.body;
	const userId = req.userId;

	try {
		const event = await Event.findOne({ title });
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}

		if (event.organizerId.toString() !== userId) {
			return res.status(403).json({ error: "Unauthorized action" });
		}

		await Event.findByIdAndDelete(event._id);
		res.status(200).json({ message: "Event deleted successfully" });
	} catch (error) {
		console.error("Error deleting event:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getEventByTitle = async (req, res) => {
	const { title } = req.body;

	try {
		const event = await Event.findOne(
			{ title },
			{ attendeeIds: 0, address: 0 }
		).populate("organizerId", { name: 1, pfp: 1, _id: 0 });
		if (!event) {
			return res.status(401).json({ error: "Event not found" });
		}
		res.status(200).json(event);
	} catch (error) {
		console.error("Error fetching event:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
export const updateEvent = async (req, res) => {
	const title = req.body.title;
	const userId = req.userId;
	const updateData = req.body;

	try {
		const event = await Event.findOne({ title });
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		if (event.organizerId.toString() !== userId) {
			return res.status(403).json({ error: "Unauthorized action" });
		}
		// Validate beginsAt and endsAt
		if (updateData.beginsAt && updateData.endsAt) {
			const beginsAt = new Date(updateData.beginsAt);
			const endsAt = new Date(updateData.endsAt);
			if (beginsAt >= endsAt) {
				return res
					.status(400)
					.json({ error: "Event end time must be after start time" });
			}
		}
		// Update the event
		const updatedEvent = await Event.findByIdAndUpdate(
			event._id,
			{ ...updateData, organizerId: userId },
			{ new: true, runValidators: true }
		);
		res.status(200).json({
			message: "Event updated successfully",
			event: updatedEvent,
		});
	} catch (error) {
		console.error("Error updating event:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const registerForEvent = async (req, res) => {
	const { title } = req.body;
	const userId = req.userId;

	try {
		const event = await Event.findOne({ title });
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		if (event.attendeeIds.includes(userId)) {
			return res
				.status(400)
				.json({ error: "Already registered for this event" });
		}
		event.requestedAttendeeIds.push(userId);
		await event.save();
		res.status(200).json({
			message: "Registered for event successfully",
			event,
		});
	} catch (error) {
		console.error("Error registering for event:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const unregisterFromEvent = async (req, res) => {
	const { title } = req.body;
	const userId = req.userId;

	try {
		const event = await Event.findOne({ title });
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		if (!event.attendeeIds.includes(userId)) {
			if (event.requestedAttendeeIds.includes(userId)) {
				event.requestedAttendeeIds = event.requestedAttendeeIds.filter(
					(id) => id.toString() !== userId
				);
				await event.save();
				return res.status(200).json({
					message: "Deregistration request cancelled successfully",
					event,
				});
			} else {
				return res
					.status(400)
					.json({ error: "Not registered for this event" });
			}
		}
		event.attendeeIds = event.attendeeIds.filter(
			(id) => id.toString() !== userId
		);
		await event.save();
		res.status(200).json({
			message: "Unregistered from event successfully",
			event,
		});
	} catch (error) {
		console.error("Error unregistering from event:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const isRegisteredForEvent = async (req, res) => {
	const { title } = req.body;
	const userId = req.userId;

	try {
		const event = await Event.findOne({ title });
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		const isRegistered = event.attendeeIds.includes(userId);
		res.status(200).json({ isRegistered });
	} catch (error) {
		console.error("Error checking registration status:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const hasRequestedToAttendEvent = async (req, res) => {
	const { title } = req.body;
	const userId = req.userId;

	try {
		const event = await Event.findOne({ title });
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		const hasRequested = event.requestedAttendeeIds.includes(userId);
		res.status(200).json({ hasRequested });
	} catch (error) {
		console.error("Error checking request status:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const isOrganizerOfEvent = async (req, res) => {
	const { title } = req.body;
	const userId = req.userId;

	try {
		const event = await Event.findOne({ title });
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		const isOrganizer = event.organizerId.toString() === userId;
		res.status(200).json({ isOrganizer });
	} catch (error) {
		console.error("Error checking organizer status:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getAddressAndAttendees = async (req, res) => {
	const { title } = req.body;
	const userId = req.userId;

	try {
		const event = await Event.findOne({ title })
			.populate("attendeeIds", "name pfp")
			.populate("requestedAttendeeIds", "name pfp");
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		if (event.organizerId.toString() === userId) {
			return res.status(200).json({
				address: event.address,
				attendees: event.attendeeIds,
				requestedAttendees: event.requestedAttendeeIds,
			});
		}
		if (
			event.attendeeIds.some(
				(attendee) => attendee._id.toString() === userId
			)
		) {
			return res.status(200).json({
				address: event.address,
				attendees: event.attendeeIds,
			});
		}
		return res.status(403).json({ error: "Unauthorized action" });
	} catch (error) {
		console.error("Error fetching address and attendees:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const approveAttendee = async (req, res) => {
	const { title, attendeeId } = req.body;
	const organizerId = req.userId;

	try {
		const event = await Event.findOne({ title });
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		if (event.organizerId.toString() !== organizerId) {
			return res.status(403).json({ error: "Unauthorized action" });
		}
		if (!event.requestedAttendeeIds.includes(attendeeId)) {
			return res
				.status(400)
				.json({ error: "Attendee has not requested to join" });
		}
		event.requestedAttendeeIds = event.requestedAttendeeIds.filter(
			(id) => id.toString() !== attendeeId
		);
		event.attendeeIds.push(attendeeId);
		await event.save();
		const populatedEvent = event.populate("attendeeIds", "name pfp");
		res.status(200).json({
			message: "Attendee approved successfully",
			populatedEvent,
		});
	} catch (error) {
		console.error("Error approving attendee:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const removeAttendee = async (req, res) => {
	const { title, attendeeId } = req.body;
	const organizerId = req.userId;
	try {
		const event = await Event.findOne({ title });
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		if (event.organizerId.toString() !== organizerId) {
			return res.status(403).json({ error: "Unauthorized action" });
		}
		if (!event.attendeeIds.includes(attendeeId)) {
			if (event.requestedAttendeeIds.includes(attendeeId)) {
				event.requestedAttendeeIds = event.requestedAttendeeIds.filter(
					(id) => id.toString() !== attendeeId
				);
				await event.save();
				return res.status(200).json({
					message: "Attendee rejected successfully",
					event,
				});
			}
			return res.status(400).json({ error: "Attendee not registered" });
		}
		event.attendeeIds = event.attendeeIds.filter(
			(id) => id.toString() !== attendeeId
		);
		await event.save();
		res.status(200).json({
			message: "Attendee removed successfully",
			event,
		});
	} catch (error) {
		console.error("Error removing attendee:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
