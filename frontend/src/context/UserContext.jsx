import React, { createContext, useEffect, useState, useContext } from "react";
import { authDataContext } from "./AuthContext";
import axios from "axios";
import { io } from "socket.io-client";

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [postData, setPostData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { serverUrl } = useContext(authDataContext);

  const getCurrentUser = async () => {
    try {
      const result = await axios.get(serverUrl + "/api/user/currentuser", {
        withCredentials: true,
      });
      setUserData(result.data.user);
    } catch (error) {
      setUserData(null);
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPost = async () => {
    try {
      const result = await axios.get(serverUrl + "/api/post/getpost", {
        withCredentials: true,
      });
      setPostData(result.data.posts || []);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const getNotifications = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/notification`, {
        withCredentials: true,
      });

      const data = res.data.notifications || [];
      setNotifications(data);
      setNotificationCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const markNotificationsRead = async () => {
    try {
      await axios.put(
        `${serverUrl}/api/notification/read`,
        {},
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setNotificationCount(0);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const clearNotifications = async () => {
    try {
      await axios.delete(`${serverUrl}/api/notification/clear`, {
        withCredentials: true,
      });

      setNotifications([]);
      setNotificationCount(0);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    getCurrentUser();
    getPost();
    getNotifications();
  }, []);

  useEffect(() => {
    if (!serverUrl || !userData?._id) return;

    const socket = io(serverUrl, { withCredentials: true });

    socket.emit("register", userData._id);

    socket.on("postCreated", (newPost) => {
      setPostData((prev) => [newPost, ...prev]);
    });

    socket.on("likeUpdated", ({ postId, likes }) => {
      setPostData((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, like: likes } : post
        )
      );
    });

    socket.on("commentAdded", ({ postId, comment }) => {
      setPostData((prev) =>
        prev.map((post) =>
          post._id === postId
            ? { ...post, comment: [...post.comment, comment] }
            : post
        )
      );
    });

    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setNotificationCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [serverUrl, userData?._id]);

  const value = {
    userData,
    setUserData,
    postData,
    setPostData,
    notifications,
    setNotifications,
    notificationCount,
    setNotificationCount,
    loading,
    getCurrentUser,
    getPost,
    getNotifications,
    markNotificationsRead,
    clearNotifications,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;