import express from "express";
import { sendRequest, respondRequest, getPendingRequests, getConnections, removeConnection, getStatus } from "../controllers/connection.controller.js";
import isAuth from "../middlewares/isAuth.js";

const connectionRouter = express.Router();

connectionRouter.post("/send/:userId", isAuth, sendRequest);
connectionRouter.put("/respond/:connectionId", isAuth, respondRequest);
connectionRouter.get("/pending", isAuth, getPendingRequests);
connectionRouter.get("/all", isAuth, getConnections);
connectionRouter.delete("/remove/:connectionId", isAuth, removeConnection);
connectionRouter.get("/status/:userId", isAuth, getStatus);

export default connectionRouter;