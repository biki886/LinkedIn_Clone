import Connection from "../models/connection.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { io, userSocketMap } from "../../index.js";

export const sendRequest = async (req, res) => {
  try {
    const sender = req.userId;
    const receiver = req.params.userId;

    if (sender.toString() === receiver.toString()) {
      return res.status(400).json({ message: "Cannot connect with yourself" });
    }

    const existing = await Connection.findOne({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    });

    if (existing) {
      return res.status(400).json({
        message:
          existing.status === "pending"
            ? "Request already pending"
            : "Already connected",
      });
    }

    const connection = await Connection.create({ sender, receiver });

    return res.status(201).json({
      success: true,
      message: "Request sent",
      connection,
    });

    const notification = await Notification.create({
      receiver,
      sender,
      type: "connection",
      message: "sent you a connection request",
    });

    const populatedNotification = await Notification.findById(
      notification._id,
    ).populate("sender", "firstName lastName profileImage headline");

    const receiverSocketId = userSocketMap.get(receiver.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newNotification", populatedNotification);
    }
  } catch (error) {
    return res.status(500).json({
      message: "Send request error",
      error: error.message,
    });
  }
};

export const respondRequest = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const connection = await Connection.findById(req.params.connectionId);

    if (!connection) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (connection.receiver.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    connection.status = status;
    await connection.save();

    if (status === "accepted") {
      await User.findByIdAndUpdate(connection.sender, {
        $addToSet: { connection: connection.receiver },
      });

      await User.findByIdAndUpdate(connection.receiver, {
        $addToSet: { connection: connection.sender },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Request ${status}`,
      connection,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Respond request error",
      error: error.message,
    });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      receiver: req.userId,
      status: "pending",
    })
      .populate("sender", "firstName lastName profileImage headline")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Get requests error",
      error: error.message,
    });
  }
};

export const getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ sender: req.userId }, { receiver: req.userId }],
      status: "accepted",
    })
      .populate("sender", "firstName lastName profileImage headline")
      .populate("receiver", "firstName lastName profileImage headline")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      connections,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Get connections error",
      error: error.message,
    });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const connection = await Connection.findByIdAndDelete(
      req.params.connectionId,
    );

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    await User.findByIdAndUpdate(connection.sender, {
      $pull: { connection: connection.receiver },
    });

    await User.findByIdAndUpdate(connection.receiver, {
      $pull: { connection: connection.sender },
    });

    return res.status(200).json({
      success: true,
      message: "Connection removed",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Remove connection error",
      error: error.message,
    });
  }
};

export const getStatus = async (req, res) => {
  try {
    const connection = await Connection.findOne({
      $or: [
        { sender: req.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.userId },
      ],
    });

    if (!connection) {
      return res.status(200).json({ status: "none" });
    }

    return res.status(200).json({
      success: true,
      status: connection.status,
      connection,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Get status error",
      error: error.message,
    });
  }
};
