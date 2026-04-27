import React, { useContext, useEffect, useState } from "react";
import Nav from "../components/Nav";
import Post from "../components/Post";
import { userDataContext } from "../context/userContext";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import {
  FaUserCircle,
  FaImage,
  FaVideo,
  FaCalendarAlt,
  FaNewspaper,
  FaMapMarkerAlt,
  FaPen,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { userData, postData, getPost } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const [openPost, setOpenPost] = useState(false);
  const [postText, setPostText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const getSuggestedUsers = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/user/suggested`, {
        withCredentials: true,
      });
      setSuggestedUsers(res.data.users || []);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    getSuggestedUsers();
  }, []);

  const closePostModal = () => {
    setOpenPost(false);
    setPostText("");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setOpenPost(true);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim() && !imageFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("description", postText);
      if (imageFile) formData.append("image", imageFile);

      await axios.post(`${serverUrl}/api/post/create`, formData, {
        withCredentials: true,
      });

      await getPost();
      closePostModal();
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await axios.post(
        `${serverUrl}/api/connection/send/${userId}`,
        {},
        { withCredentials: true }
      );

      setSuggestedUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <div className="bg-[#f3f2ef] min-h-screen pt-[60px] pb-[70px]">
      <Nav />

      <div className="w-full max-w-[1128px] mx-auto px-3 grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr_300px] gap-4 lg:gap-6">
        <aside className="hidden md:block">
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="h-20 bg-gray-200">
              {userData?.coverImage && (
                <img
                  src={userData.coverImage}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="px-4 pb-4 -mt-10">
              {userData?.profileImage ? (
                <img
                  src={userData.profileImage}
                  alt="profile"
                  className="w-20 h-20 rounded-full border-4 border-white object-cover bg-white"
                />
              ) : (
                <FaUserCircle className="text-7xl text-gray-500 bg-white rounded-full" />
              )}

              <h2 className="mt-2 font-semibold text-gray-900">
                {userData?.firstName || "User"} {userData?.lastName || ""}
              </h2>

              <p className="text-sm text-gray-700 mt-1">
                {userData?.headline || "Add your headline"}
              </p>

              <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <FaMapMarkerAlt />
                {userData?.location || "Add your location"}
              </p>

              <button
                onClick={() => navigate("/profile/edit")}
                className="mt-3 w-full flex items-center justify-center gap-2 border border-[#0a66c2] text-[#0a66c2] rounded-full py-1.5 text-sm font-semibold hover:bg-blue-50"
              >
                <FaPen />
                Edit Profile
              </button>
            </div>
          </div>
        </aside>

        <main>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              {userData?.profileImage ? (
                <img
                  src={userData.profileImage}
                  alt="profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="text-5xl text-gray-500" />
              )}

              <button
                onClick={() => setOpenPost(true)}
                className="flex-1 w-full text-left border border-gray-400 rounded-full px-4 py-3 text-gray-500 font-medium hover:bg-gray-100"
              >
                Start a post
              </button>
            </div>

            <div className="flex justify-around mt-4 text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded">
                <FaImage className="text-blue-500" />
                <span className="text-sm font-medium">Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </label>

              <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded">
                <FaVideo className="text-green-600" />
                <span className="text-sm font-medium">Video</span>
              </button>

              <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded">
                <FaCalendarAlt className="text-orange-500" />
                <span className="text-sm font-medium">Event</span>
              </button>

              <button className="hidden sm:flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded">
                <FaNewspaper className="text-red-500" />
                <span className="text-sm font-medium">Article</span>
              </button>
            </div>
          </div>

          {postData && postData.length > 0 ? (
            <div className="space-y-4 mt-4">
              {postData.map((post) => (
                <Post key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-6">No posts yet</div>
          )}
        </main>

        <aside className="hidden lg:block">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold text-gray-900 mb-3">
              Add to your feed
            </h2>

            {suggestedUsers.length > 0 ? (
              <div className="space-y-4">
                {suggestedUsers.map((user) => (
                  <div key={user._id} className="flex items-start gap-3">
                    <div
                      onClick={() => navigate(`/profile/${user._id}`)}
                      className="flex gap-2 cursor-pointer min-w-0 flex-1"
                    >
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="profile"
                          className="w-11 h-11 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <FaUserCircle className="text-4xl text-gray-500 shrink-0" />
                      )}

                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate hover:underline">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {user.headline || "LinkedIn user"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleFollow(user._id)}
                      className="text-sm border border-[#0a66c2] text-[#0a66c2] px-3 py-1 rounded-full hover:bg-blue-50 shrink-0"
                    >
                      + Follow
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No suggestions available</p>
            )}
          </div>
        </aside>
      </div>

      {openPost && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-start sm:items-center justify-center px-3 py-4 sm:py-8 overflow-y-auto">
          <div className="bg-white w-full max-w-[95vw] sm:max-w-[560px] md:max-w-[620px] lg:max-w-[650px] max-h-[90vh] rounded-lg shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">
                Create a post
              </h2>

              <button
                type="button"
                onClick={closePostModal}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleCreatePost}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="p-5 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  {userData?.profileImage ? (
                    <img
                      src={userData.profileImage}
                      alt="profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="text-5xl text-gray-500" />
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {userData?.firstName || "User"} {userData?.lastName || ""}
                    </h3>
                    <p className="text-xs text-gray-500">Post to anyone</p>
                  </div>
                </div>

                <textarea
                  autoFocus
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="What do you want to talk about?"
                  className="w-full min-h-[130px] sm:min-h-[150px] md:min-h-[170px] resize-none outline-none text-base sm:text-lg"
                />

                {imagePreview && (
                  <div className="relative mt-3">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full max-h-[240px] sm:max-h-[320px] md:max-h-[380px] object-contain rounded-lg bg-gray-100"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-black text-white px-3 py-1 rounded-full text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t px-5 py-4 shrink-0 bg-white">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:bg-gray-100 px-3 py-2 rounded">
                  <FaImage className="text-blue-500" />
                  <span className="text-sm font-medium">Add media</span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading || (!postText.trim() && !imageFile)}
                  className="px-6 py-2 rounded-full bg-[#0a66c2] text-white font-semibold hover:bg-[#004182] disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;