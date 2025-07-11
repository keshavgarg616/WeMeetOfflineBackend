import express from "express";
const app = express();
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import eventRouter from "./routes/eventRouter.js";
import expressUploader from "express-fileupload";
import logRouter from "./routes/logRouter.js";

dotenv.config();

const port = 3000;
const mongoURL = `mongodb+srv://${process.env.MongoDBUsername}:${process.env.MongoDBPswd}@${process.env.MongoDBClusterString}.mongodb.net/we-meet-offline?retryWrites=true&w=majority&appName=Cluster0`;

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(expressUploader());
mongoose
	.connect(mongoURL)
	.then(() => console.log("Connected to MongoDB successfully"))
	.catch((err) => console.error("Error connecting to MongoDB:", err));

app.use("/", userRouter);
app.use("/", eventRouter);
app.use("/", logRouter);

app.listen(port, () => {
	console.log(`Server running at port ${port}`);
});
