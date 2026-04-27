import React, { useContext, useEffect, useState } from "react";
import Nav from "../components/Nav";
import Post from "../components/Post";
import ConnectionButton from "../components/ConnectionButton";
import { userDataContext } from "../context/UserContext.jsx";
import { authDataContext } from "../context/AuthContext.jsx";
import axios from "axios";
import {
  FaUserCircle,
  FaMapMarkerAlt,
  FaPen,
  FaPlus,
  FaBriefcase,
  FaGraduationCap,
  FaTools,
  FaUsers,
  FaVenusMars,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

const Profile = () => {
  const { userData, postData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);

  const navigate = useNavigate();
  const { userId } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const isOwnProfile =
    !userId || userId?.toString() === userData?._id?.toString();

  const getProfileUser = async () => {
    try {
      setProfileLoading(true);

      if (isOwnProfile) {
        setProfileUser(userData);
        return;
      }

      const res = await axios.get(`${serverUrl}/api/user/profile/${userId}`, {
        withCredentials: true,
      });

      setProfileUser(res.data.user);
    } catch (error) {
      console.log("GET PROFILE ERROR:", error.response?.data || error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    getProfileUser();
  }, [userId, userData]);

  const profilePosts =
    postData?.filter(
      (post) => post?.author?._id?.toString() === profileUser?._id?.toString()
    ) || [];

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] pt-[60px]">
        <Nav />
        <div className="text-center mt-10 text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] pt-[60px] pb-[70px]">
      <Nav />

      <div className="max-w-[1128px] mx-auto px-3 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <main className="space-y-4">
          <section className="bg-white rounded-lg border overflow-hidden">
            <div className="h-44 sm:h-52 bg-gray-300">
              {profileUser?.coverImage && (
                <img
                  src={profileUser.coverImage}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="px-5 sm:px-6 pb-6 relative">
              <div className="-mt-16 sm:-mt-20">
                {profileUser?.profileImage ? (
                  <img
                    src={profileUser.profileImage}
                    alt="profile"
                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white object-cover bg-white"
                  />
                ) : (
                  <FaUserCircle className="text-[128px] sm:text-[144px] text-gray-500 bg-white rounded-full" />
                )}
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="absolute top-4 right-4 text-gray-600 hover:bg-gray-100 p-2 rounded-full"
                >
                  <FaPen />
                </button>
              )}

              <h1 className="text-2xl font-semibold mt-2 text-gray-900">
                {profileUser?.firstName || "User"} {profileUser?.lastName || ""}
              </h1>

              <p className="text-gray-700 mt-1">
                {profileUser?.headline || "Add your headline"}
              </p>

              <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <FaMapMarkerAlt />
                {profileUser?.location || "Add location"}
              </p>

              {profileUser?.gender && (
                <p className="flex items-center gap-1 text-sm text-gray-500 mt-1 capitalize">
                  <FaVenusMars />
                  {profileUser.gender}
                </p>
              )}

              <p className="text-sm text-[#0a66c2] font-semibold mt-2">
                {profileUser?.connection?.length || 0} connections
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {isOwnProfile ? (
                  <button
                    onClick={() => navigate("/profile/edit")}
                    className="bg-[#0a66c2] text-white px-5 py-1.5 rounded-full font-semibold hover:bg-[#004182]"
                  >
                    Edit profile
                  </button>
                ) : (
                  <ConnectionButton
                    userId={profileUser?._id}
                    isMyPost={false}
                    large={true}
                  />
                )}
              </div>
            </div>
          </section>

          <ProfileSection
            title="Experience"
            icon={<FaBriefcase />}
            onAdd={isOwnProfile ? () => navigate("/profile/edit") : null}
          >
            {profileUser?.experience?.length > 0 ? (
              profileUser.experience.map((exp, index) => (
                <div key={index} className="py-4 border-b last:border-b-0">
                  <h3 className="font-semibold text-gray-900">
                    {exp.title || "Title"}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {exp.company || "Company"}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <EmptyState text="No experience added yet." />
            )}
          </ProfileSection>

          <ProfileSection
            title="Education"
            icon={<FaGraduationCap />}
            onAdd={isOwnProfile ? () => navigate("/profile/edit") : null}
          >
            {profileUser?.education?.length > 0 ? (
              profileUser.education.map((edu, index) => (
                <div key={index} className="py-4 border-b last:border-b-0">
                  <h3 className="font-semibold text-gray-900">
                    {edu.college || "College"}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {edu.degree || "Degree"}
                    {edu.fieldOfStudy ? ` • ${edu.fieldOfStudy}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState text="No education added yet." />
            )}
          </ProfileSection>

          <ProfileSection
            title="Skills"
            icon={<FaTools />}
            onAdd={isOwnProfile ? () => navigate("/profile/edit") : null}
          >
            {profileUser?.skills?.length > 0 ? (
              <div className="space-y-2">
                {profileUser.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="border rounded-lg px-4 py-3 font-medium text-gray-800 hover:bg-gray-50"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No skills added yet." />
            )}
          </ProfileSection>

          <ProfileSection title="Posts">
            {profilePosts.length > 0 ? (
              <div className="space-y-4">
                {profilePosts.map((post) => (
                  <Post key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <EmptyState text="No posts yet." />
            )}
          </ProfileSection>

          <ProfileSection title="Connections" icon={<FaUsers />}>
            <p className="text-sm text-gray-700">
              {profileUser?.connection?.length || 0} connections
            </p>

            {isOwnProfile && (
              <button
                onClick={() => navigate("/network")}
                className="mt-3 border border-[#0a66c2] text-[#0a66c2] px-5 py-1.5 rounded-full font-semibold hover:bg-blue-50"
              >
                View network
              </button>
            )}
          </ProfileSection>
        </main>

        <aside className="hidden lg:block space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold text-gray-900">Profile language</h2>
            <p className="text-sm text-gray-500 mt-1">English</p>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold text-gray-900">Public profile & URL</h2>
            <p className="text-sm text-gray-500 mt-1">
              linkedin.com/in/{profileUser?.userName || "username"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const ProfileSection = ({ title, icon, children, onAdd }) => {
  return (
    <section className="bg-white rounded-lg border p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
          {icon}
          {title}
        </h2>

        {onAdd && (
          <button
            onClick={onAdd}
            className="text-gray-600 hover:bg-gray-100 p-2 rounded-full"
          >
            <FaPlus />
          </button>
        )}
      </div>

      {children}
    </section>
  );
};

const EmptyState = ({ text }) => {
  return <p className="text-sm text-gray-500">{text}</p>;
};

export default Profile;
