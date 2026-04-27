import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getNotifications,
  markAsRead,
  clearAllNotifications,
} from "../controllers/notification.controller.js";

const notificationRouter = express.Router();

notificationRouter.get("/", isAuth, getNotifications);
notificationRouter.put("/read", isAuth, markAsRead);
notificationRouter.delete("/clear", isAuth, clearAllNotifications);

export default notificationRouter;