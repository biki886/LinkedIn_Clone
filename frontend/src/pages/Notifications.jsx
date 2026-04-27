import React, { useContext, useEffect } from "react";
import Nav from "../components/Nav";
import { userDataContext } from "../context/userContext";
import { FaUserCircle, FaTrash, FaBell } from "react-icons/fa";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const {
    notifications,
    getNotifications,
    markNotificationsRead,
    clearNotifications,
  } = useContext(userDataContext);

  const navigate = useNavigate();

  useEffect(() => {
    getNotifications();
    markNotificationsRead();
  }, []);

  const getIconText = (type) => {
    if (type === "like") return "👍";
    if (type === "comment") return "💬";
    if (type === "connection") return "🤝";
    return "🔔";
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] pt-[60px] pb-[70px]">
      <Nav />

      <div className="max-w-[900px] mx-auto px-3">
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaBell className="text-[#0a66c2]" />
              <h1 className="text-xl font-semibold text-gray-900">
                Notifications
              </h1>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-sm font-semibold text-gray-600 hover:text-red-600"
              >
                Clear all
              </button>
            )}
          </div>

          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 flex items-start justify-between gap-3 border-b last:border-b-0 ${
                  notification.isRead ? "bg-white" : "bg-blue-50"
                }`}
              >
                <div
                  onClick={() =>
                    navigate(`/profile/${notification.sender?._id}`)
                  }
                  className="flex gap-3 cursor-pointer min-w-0 flex-1"
                >
                  <div className="relative shrink-0">
                    {notification.sender?.profileImage ? (
                      <img
                        src={notification.sender.profileImage}
                        alt="profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="text-5xl text-gray-500" />
                    )}

                    <span className="absolute -bottom-1 -right-1 bg-white rounded-full text-sm">
                      {getIconText(notification.type)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold hover:underline">
                        {notification.sender?.firstName}{" "}
                        {notification.sender?.lastName}
                      </span>{" "}
                      {notification.message}
                    </p>

                    {notification.post?.description && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        “{notification.post.description}”
                      </p>
                    )}

                    {notification.post?.image && (
                      <img
                        src={notification.post.image}
                        alt="post"
                        className="mt-2 w-24 h-16 object-cover rounded"
                      />
                    )}

                    <p className="text-xs text-[#0a66c2] mt-1">
                      {moment(notification.createdAt).fromNow()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={clearNotifications}
                  className="text-gray-400 hover:text-red-600 p-2"
                  title="Clear all"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FaBell className="mx-auto text-4xl mb-3 text-gray-400" />
              <p>No notifications yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;