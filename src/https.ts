import compression from "compression";
import express from "express";
import "express-async-errors";
import path from "path";
import helmet from "helmet";
import { createServer } from "http";
import createConnection from "./database";
import { fakePoweredBy } from "./middlewares/fakePoweredBy";
import { handlerError } from "./middlewares/handlerError";
import cors from "cors";
import { userRoutes } from "./routes/user";
import { messageRoutes } from "./routes/message";
import { authRoutes } from "./routes/auth";



process.on("unhandledRejection", console.error)
createConnection()


const app = express();
const http = createServer(app);

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
// app.use(fakePoweredBy);
app.use(compression({ level: 9 }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
    "/uploads",
    express.static(path.join(__dirname, "..", "uploads", "files"))
);



app.use(authRoutes);
app.use(userRoutes);
app.use(messageRoutes);
app.use(handlerError);

export { http };