import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { authDataContext } from "../context/AuthContext.jsx";
import { userDataContext } from "../context/UserContext.jsx";

const ConnectionButton = ({ userId, isMyPost }) => {
  const { serverUrl } = useContext(authDataContext);
  const { getCurrentUser } = useContext(userDataContext);

  const [status, setStatus] = useState("none");
  const [connectionId, setConnectionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const getStatus = async () => {
    if (!userId || isMyPost) return;

    try {
      const res = await axios.get(
        `${serverUrl}/api/connection/status/${userId}`,
        { withCredentials: true }
      );

      setStatus(res.data.status);
      setConnectionId(res.data.connection?._id || null);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    getStatus();
  }, [userId]);

  const handleConnect = async () => {
    try {
      setLoading(true);

      if (status === "none") {
        await axios.post(
          `${serverUrl}/api/connection/send/${userId}`,
          {},
          { withCredentials: true }
        );
        setStatus("pending");
      }

      if (status === "accepted" && connectionId) {
        await axios.delete(
          `${serverUrl}/api/connection/remove/${connectionId}`,
          { withCredentials: true }
        );
        setStatus("none");
        setConnectionId(null);
        await getCurrentUser();
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isMyPost) return null;

  return (
    <button
      onClick={handleConnect}
      disabled={loading || status === "pending"}
      className={`text-sm font-semibold px-3 py-1 rounded-full disabled:opacity-60 ${
        status === "accepted"
          ? "text-gray-600 hover:bg-gray-100"
          : status === "pending"
          ? "text-gray-500"
          : "text-[#0a66c2] hover:bg-blue-50"
      }`}
    >
      {loading
        ? "..."
        : status === "accepted"
        ? "Following"
        : status === "pending"
        ? "Pending"
        : "+ Follow"}
    </button>
  );
};

export default ConnectionButton;
