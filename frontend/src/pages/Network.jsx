import React, { useContext, useEffect, useState } from "react";
import Nav from "../components/Nav";
import axios from "axios";
import { authDataContext } from "../context/AuthContext";
import { userDataContext } from "../context/userContext";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Network = () => {
  const { serverUrl } = useContext(authDataContext);
  const { userData, getCurrentUser } = useContext(userDataContext);
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);

  const getRequests = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/connection/pending`, {
        withCredentials: true,
      });
      setRequests(res.data.requests || []);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const getConnections = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/connection/all`, {
        withCredentials: true,
      });
      setConnections(res.data.connections || []);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const handleRespond = async (connectionId, status) => {
    try {
      await axios.put(
        `${serverUrl}/api/connection/respond/${connectionId}`,
        { status },
        { withCredentials: true }
      );

      getRequests();
      getConnections();
      getCurrentUser();
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const handleRemove = async (connectionId) => {
    try {
      await axios.delete(`${serverUrl}/api/connection/remove/${connectionId}`, {
        withCredentials: true,
      });

      getConnections();
      getCurrentUser();
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const goToProfile = (personId) => {
    if (!personId) return;

    if (personId === userData?._id) {
      navigate("/profile");
    } else {
      navigate(`/profile/${personId}`);
    }
  };

  useEffect(() => {
    getRequests();
    getConnections();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f2ef] pt-[60px] pb-[70px]">
      <Nav />

      <div className="max-w-[1128px] mx-auto px-3 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5">
        <aside className="hidden md:block">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold text-gray-900 mb-4">
              Manage my network
            </h2>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Connections</span>
                <span>{connections.length}</span>
              </div>

              <div className="flex justify-between">
                <span>Pending requests</span>
                <span>{requests.length}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-4">
          <section className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Invitations
              </h2>
            </div>

            {requests.length > 0 ? (
              requests.map((req) => (
                <div
                  key={req._id}
                  className="p-4 flex items-center justify-between gap-3 border-b last:border-b-0"
                >
                  <div
                    onClick={() => goToProfile(req.sender?._id)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                  >
                    {req.sender?.profileImage ? (
                      <img
                        src={req.sender.profileImage}
                        alt="profile"
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="text-5xl text-gray-500" />
                    )}

                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 hover:underline">
                        {req.sender?.firstName} {req.sender?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {req.sender?.headline || "LinkedIn user"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleRespond(req._id, "rejected")}
                      className="px-4 py-1.5 rounded-full border font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      Ignore
                    </button>

                    <button
                      onClick={() => handleRespond(req._id, "accepted")}
                      className="px-4 py-1.5 rounded-full border border-[#0a66c2] text-[#0a66c2] font-semibold hover:bg-blue-50"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500">
                No pending invitations.
              </p>
            )}
          </section>

          <section className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Your connections
              </h2>
            </div>

            {connections.length > 0 ? (
              connections.map((conn) => {
                const person =
                  conn.sender?._id === userData?._id
                    ? conn.receiver
                    : conn.sender;

                return (
                  <div
                    key={conn._id}
                    className="p-4 flex items-center justify-between gap-3 border-b last:border-b-0"
                  >
                    <div
                      onClick={() => goToProfile(person?._id)}
                      className="flex items-center gap-3 min-w-0 cursor-pointer"
                    >
                      {person?.profileImage ? (
                        <img
                          src={person.profileImage}
                          alt="profile"
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="text-5xl text-gray-500" />
                      )}

                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 hover:underline">
                          {person?.firstName} {person?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {person?.headline || "LinkedIn user"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(conn._id)}
                      className="px-4 py-1.5 rounded-full border font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="p-4 text-sm text-gray-500">No connections yet.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Network;