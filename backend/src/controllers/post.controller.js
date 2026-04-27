import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import { io, userSocketMap } from "../../index.js";

export const createPost = async (req, res) => {
  try {
    const { description } = req.body;

    let image = "";

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const newPost = await Post.create({
      author: req.userId,
      description,
      image,
    });

    const populatedPost = await Post.findById(newPost._id).populate(
      "author",
      "firstName lastName profileImage headline",
    );

    io.emit("postCreated", populatedPost);

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Create post error",
      success: false,
      error: error.message,
    });
  }
};

export const getPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "firstName lastName profileImage headline")
      .populate("comment.user", "firstName lastName profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Get post error",
      success: false,
      error: error.message,
    });
  }
};

export const like = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }

    const alreadyLiked = post.like.some(
      (id) => id.toString() === req.userId.toString(),
    );

    if (alreadyLiked) {
      post.like = post.like.filter(
        (id) => id.toString() !== req.userId.toString(),
      );
    } else {
      post.like.push(req.userId);
    }

    await post.save();

    if (!alreadyLiked && post.author.toString() !== req.userId.toString()) {
      const notification = await Notification.create({
        receiver: post.author,
        sender: req.userId,
        type: "like",
        post: post._id,
        message: "liked your post",
      });

      const populatedNotification = await Notification.findById(
        notification._id,
      )
        .populate("sender", "firstName lastName profileImage headline")
        .populate("post", "description image");

      const receiverSocketId = userSocketMap.get(post.author.toString());

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newNotification", populatedNotification);
      }
    }

    io.emit("likeUpdated", {
      postId,
      likes: post.like,
    });
    return res.status(200).json({
      success: true,
      message: "Like updated",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Like error",
      success: false,
      error: error.message,
    });
  }
};

export const comment = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }

    post.comment.push({
      user: req.userId,
      content: req.body.text,
    });

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "firstName lastName profileImage headline")
      .populate("comment.user", "firstName lastName profileImage");

    const newComment =
      updatedPost.comment[updatedPost.comment.length - 1];

    io.emit("commentAdded", {
      postId,
      comment: newComment,
    });

    if (post.author.toString() !== req.userId.toString()) {
      const notification = await Notification.create({
        receiver: post.author,
        sender: req.userId,
        type: "comment",
        post: post._id,
        message: "commented on your post",
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate("sender", "firstName lastName profileImage headline")
        .populate("post", "description image");

      const receiverSocketId = userSocketMap.get(post.author.toString());

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newNotification", populatedNotification);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Comment added",
      post: updatedPost,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Comment error",
      success: false,
      error: error.message,
    });
  }
};