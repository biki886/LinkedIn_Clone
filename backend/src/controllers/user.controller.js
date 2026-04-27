import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import Connection from "../models/connection.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User doesn't found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, headline, location, gender, skills, education, experience } = req.body;

    const updateData = { firstName, lastName, headline, location, gender };

    if (skills) updateData.skills = JSON.parse(skills);
    if (education) updateData.education = JSON.parse(education);
    if (experience) updateData.experience = JSON.parse(experience);

    if (req.files?.profileImage?.[0]) {
      updateData.profileImage = await uploadOnCloudinary(req.files.profileImage[0].path);
    }

    if (req.files?.coverImage?.[0]) {
      updateData.coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, { returnDocument: "after" }).select("-password");
    res.status(200).json({ message: "Profile updated successfully", success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Update profile error", success: false, error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Get profile error", error: error.message });
  }
};


export const search = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { userName: { $regex: query, $options: "i" } },
        { headline: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { skills: { $regex: query, $options: "i" } },
      ],
    }).select("-password");

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Search error",
      error: error.message,
    });
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    const myId = req.userId;

    const myUser = await User.findById(myId).select("connection");

    const connectionDocs = await Connection.find({
      $or: [{ sender: myId }, { receiver: myId }],
    });

    const excludedIds = new Set();
    excludedIds.add(myId.toString());

    myUser?.connection?.forEach((id) => excludedIds.add(id.toString()));

    connectionDocs.forEach((conn) => {
      excludedIds.add(conn.sender.toString());
      excludedIds.add(conn.receiver.toString());
    });

    const suggestedUsers = await User.find({
      _id: { $nin: Array.from(excludedIds) },
    })
      .select("-password")
      .limit(10);

    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Get suggested users error",
      error: error.message,
    });
  }
};