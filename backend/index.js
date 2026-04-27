import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import authRouter from "./src/routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./src/routes/user.route.js";
import postRouter from "./src/routes/post.route.js";
import connectionRouter from "./src/routes/connection.route.js";
import notificationRouter from "./src/routes/notification.route.js";
import http from "http";
import { Server } from "socket.io";
dotenv.config();

let app = express();
let server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "https://linkedin-frontend-ph51.onrender.com",
    credentials: true,
  },
});
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://linkedin-frontend-ph51.onrender.com",
    credentials: true,
  }),
);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/connection", connectionRouter);
app.use("/api/notification", notificationRouter);
export const userSocketMap = new Map();

io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  socket.on("register", (userid) => {
    userSocketMap.set(userid, socket.id);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  connectDB();
  console.log(`Server is running at ${port}`);
});
