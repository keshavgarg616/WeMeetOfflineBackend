import { Router } from "express";
import { createLog } from "../controllers/logController.js";
const logRouter = Router();

logRouter.post("/log", createLog);

export default logRouter;
