import React, { useContext, useState } from "react";
import moment from "moment";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/userContext";
import { authDataContext } from "../context/AuthContext";
import ConnectionButton from "./ConnectionButton";
import {
  FaUserCircle,
  FaThumbsUp,
  FaRegCommentDots,
  FaShare,
  FaPaperPlane,
} from "react-icons/fa";

const Post = ({ post }) => {
  const { userData, getPost } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [commentText, setCommentText] = useState("");

  const description = post?.description || "";
  const isLongText = description.length > 180;
  const visibleText =
    expanded || !isLongText ? description : description.slice(0, 180) + "...";

  const isLiked = post?.like?.some(
    (id) => id?.toString() === userData?._id?.toString()
  );

  const isMyPost = post?.author?._id?.toString() === userData?._id?.toString();

  const handleProfileClick = () => {
    if (isMyPost) {
      navigate("/profile");
    } else {
      navigate(`/profile/${post?.author?._id}`);
    }
  };

  const handleLike = async () => {
    try {
      await axios.put(
        `${serverUrl}/api/post/like/${post._id}`,
        {},
        { withCredentials: true }
      );

      await getPost();
    } catch (error) {
      console.log("LIKE ERROR:", error.response?.data || error.message);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    try {
      await axios.post(
        `${serverUrl}/api/post/comment/${post._id}`,
        { text: commentText },
        { withCredentials: true }
      );

      setCommentText("");
      await getPost();
    } catch (error) {
      console.log("COMMENT ERROR:", error.response?.data || error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="p-4 flex items-start justify-between gap-3">
        <div
          onClick={handleProfileClick}
          className="flex gap-3 min-w-0 cursor-pointer"
        >
          {post?.author?.profileImage ? (
            <img
              src={post.author.profileImage}
              alt="profile"
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <FaUserCircle className="text-5xl text-gray-500 shrink-0" />
          )}

          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate hover:underline">
              {post?.author?.firstName || "User"} {post?.author?.lastName || ""}
            </h3>

            <p className="text-xs text-gray-500 truncate">
              {post?.author?.headline || "LinkedIn user"}
            </p>

            <p className="text-xs text-gray-400">
              {post?.createdAt ? moment(post.createdAt).fromNow() : "Just now"}{" "}
              • 🌐
            </p>
          </div>
        </div>

        <ConnectionButton userId={post?.author?._id} isMyPost={isMyPost} />
      </div>

      {description && (
        <div className="px-4 pb-3 text-sm text-gray-800 whitespace-pre-line break-words">
          {visibleText}

          {isLongText && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 text-gray-500 font-semibold hover:underline"
            >
              {expanded ? "show less" : "see more"}
            </button>
          )}
        </div>
      )}

      {post?.image && (
        <img
          src={post.image}
          alt="post"
          className="w-full max-h-[520px] object-contain bg-black"
        />
      )}

      <div className="px-4 py-2 text-xs text-gray-500 flex justify-between border-b">
        <span className={isLiked ? "text-[#0a66c2]" : ""}>
          👍 {post?.like?.length || 0}
        </span>

        <button onClick={() => setShowComment(!showComment)}>
          {post?.comment?.length || 0} comments
        </button>
      </div>

      <div className="grid grid-cols-4 text-sm">
        <button
          onClick={handleLike}
          className={`flex items-center justify-center gap-2 py-3 hover:bg-gray-100 transition ${
            isLiked ? "text-[#0a66c2] font-semibold" : "text-gray-600"
          }`}
        >
          <FaThumbsUp />
          <span>{isLiked ? "Liked" : "Like"}</span>
        </button>

        <button
          onClick={() => setShowComment(!showComment)}
          className="flex items-center justify-center gap-2 py-3 hover:bg-gray-100 text-gray-600"
        >
          <FaRegCommentDots />
          <span>Comment</span>
        </button>

        <button className="flex items-center justify-center gap-2 py-3 hover:bg-gray-100 text-gray-600">
          <FaShare />
          <span>Repost</span>
        </button>

        <button className="flex items-center justify-center gap-2 py-3 hover:bg-gray-100 text-gray-600">
          <FaPaperPlane />
          <span>Send</span>
        </button>
      </div>

      {showComment && (
        <div className="border-t p-4">
          <form onSubmit={handleComment} className="flex gap-2">
            {userData?.profileImage ? (
              <img
                src={userData.profileImage}
                alt="me"
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
            ) : (
              <FaUserCircle className="text-4xl text-gray-500 shrink-0" />
            )}

            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 min-w-0 border border-gray-300 rounded-full px-4 py-2 outline-none focus:border-[#0a66c2]"
            />

            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 rounded-full bg-[#0a66c2] text-white font-semibold disabled:bg-gray-300"
            >
              Post
            </button>
          </form>

          <div className="mt-4 space-y-3">
            {post?.comment?.map((c, index) => (
              <div key={c?._id || index} className="flex gap-2">
                {c?.user?.profileImage ? (
                  <img
                    src={c.user.profileImage}
                    alt="user"
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <FaUserCircle className="text-3xl text-gray-500 shrink-0" />
                )}

                <div className="bg-gray-100 px-3 py-2 rounded-lg min-w-0">
                  <h4 className="text-xs font-semibold">
                    {c?.user?.firstName || "User"} {c?.user?.lastName || ""}
                  </h4>
                  <p className="text-sm break-words">{c?.content || c?.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;