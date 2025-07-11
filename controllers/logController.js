import Log from "../schemas/logSchema.js";

export const createLog = async (req, res) => {
	try {
		const log = new Log(req.body);
		await log.save();
		res.status(201).json(log);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};
