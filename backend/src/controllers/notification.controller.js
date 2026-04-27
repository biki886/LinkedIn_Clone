import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.userId })
      .populate("sender", "firstName lastName profileImage headline")
      .populate("post", "description image")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    return res.status(500).json({
      message: "Get notifications error",
      error: error.message,
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.userId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Mark as read error",
      error: error.message,
    });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ receiver: req.userId });

    return res.status(200).json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Clear notifications error",
      error: error.message,
    });
  }
};