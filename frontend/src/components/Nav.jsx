import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserFriends,
  FaBriefcase,
  FaCommentDots,
  FaBell,
  FaSearch,
  FaUserCircle,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import { userDataContext } from "../context/userContext";
import { authDataContext } from "../context/AuthContext";

const Nav = () => {
  const { userData, setUserData, notificationCount } =
    useContext(userDataContext);

  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const [activeSearch, setActiveSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("Home");
  const [openMe, setOpenMe] = useState(false);

  const navItems = [
    { icon: <FaHome />, label: "Home", path: "/" },
    { icon: <FaUserFriends />, label: "My Network", path: "/network" },
    { icon: <FaBell />, label: "Notifications", path: "/notifications" },
  ];

  const handleNavClick = (item) => {
    setActiveTab(item.label);
    setOpenMe(false);
    navigate(item.path);
  };

  const searchUsers = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setSearchLoading(true);

      const res = await axios.get(
        `${serverUrl}/api/user/search?query=${value}`,
        { withCredentials: true }
      );

      setSearchResults(res.data.users || []);
      setShowResults(true);
    } catch (error) {
      console.log("SEARCH ERROR:", error.response?.data || error.message);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchText);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchUsers(searchText);
  };

  const handleResultClick = (userId) => {
    setSearchText("");
    setSearchResults([]);
    setShowResults(false);
    setActiveSearch(false);

    if (userId === userData?._id) {
      navigate("/profile");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  const closeSearch = () => {
    setActiveSearch(false);
    setSearchText("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleLogout = async () => {
    try {
      await axios.get(serverUrl + "/api/auth/logout", {
        withCredentials: true,
      });

      setUserData(null);
      navigate("/login");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const SearchDropdown = () => {
    if (!showResults || !searchText.trim()) return null;

    return (
      <div className="absolute top-[42px] left-0 w-full bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden z-[999]">
        {searchLoading ? (
          <p className="p-3 text-sm text-gray-500">Searching...</p>
        ) : searchResults.length > 0 ? (
          searchResults.map((user) => (
            <div
              key={user._id}
              onClick={() => handleResultClick(user._id)}
              className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="text-4xl text-gray-500" />
              )}

              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {user.headline || user.userName || "LinkedIn user"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="p-3 text-sm text-gray-500">No users found</p>
        )}
      </div>
    );
  };

  const NavIcon = ({ item }) => {
    return (
      <div className="relative">
        {item.icon}

        {item.label === "Notifications" && notificationCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
      </div>
    );
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 fixed top-0 left-0 z-50">
      <div className="max-w-[1128px] mx-auto h-[52px] flex items-center px-3">
        {activeSearch ? (
          <form
            onSubmit={handleSearch}
            className="sm:hidden flex items-center gap-2 w-full relative"
          >
            <div className="flex items-center bg-[#eef3f8] h-9 px-3 rounded flex-1 relative">
              <FaSearch className="text-gray-600 text-sm" />
              <input
                autoFocus
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none px-2 text-sm w-full"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => searchText && setShowResults(true)}
              />
              <SearchDropdown />
            </div>

            <button
              type="button"
              onClick={closeSearch}
              className="text-gray-600 text-xl"
            >
              <FaTimes />
            </button>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-1">
              <div
                onClick={() => navigate("/")}
                className="w-9 h-9 bg-[#0a66c2] text-white flex items-center justify-center rounded-sm font-bold text-2xl cursor-pointer"
              >
                in
              </div>

              <form
                onSubmit={handleSearch}
                className="hidden sm:flex items-center bg-[#eef3f8] h-9 px-3 rounded w-[280px] relative"
              >
                <FaSearch className="text-gray-600 text-sm" />
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent outline-none px-2 text-sm w-full"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onFocus={() => searchText && setShowResults(true)}
                />
                <SearchDropdown />
              </form>

              <button
                onClick={() => setActiveSearch(true)}
                className="sm:hidden w-9 h-9 flex items-center justify-center bg-[#eef3f8] rounded"
              >
                <FaSearch className="text-gray-600" />
              </button>
            </div>

            <div className="hidden md:flex items-center h-full">
              {navItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleNavClick(item)}
                  className={`w-[80px] h-full flex flex-col items-center justify-center cursor-pointer border-b-2 ${
                    activeTab === item.label
                      ? "text-black border-black"
                      : "text-gray-600 border-transparent hover:text-black"
                  }`}
                >
                  <span className="text-xl">
                    <NavIcon item={item} />
                  </span>

                  <span className="text-[11px] leading-none mt-1">
                    {item.label}
                  </span>
                </div>
              ))}

              <div className="relative">
                <div
                  onClick={() => setOpenMe(!openMe)}
                  className="w-[70px] h-[52px] flex flex-col items-center justify-center text-gray-600 hover:text-black cursor-pointer border-r border-gray-200"
                >
                  {userData?.profileImage ? (
                    <img
                      src={userData.profileImage}
                      alt="profile"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="text-2xl" />
                  )}
                  <span className="text-[11px] leading-none mt-1">Me ▼</span>
                </div>

                {openMe && (
                  <div className="absolute right-0 top-[52px] w-64 bg-white border border-gray-200 shadow-lg rounded-md p-3">
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

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {userData?.firstName || "User"}{" "}
                          {userData?.lastName || ""}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {userData?.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        navigate("/profile");
                        setOpenMe(false);
                      }}
                      className="w-full mt-3 border border-[#0a66c2] text-[#0a66c2] rounded-full py-1 text-sm font-semibold hover:bg-blue-50"
                    >
                      View Profile
                    </button>

                    <hr className="my-3" />

                    <button
                      onClick={handleLogout}
                      className="text-sm text-gray-700 hover:underline"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="relative md:hidden">
              <div
                className="cursor-pointer"
                onClick={() => setOpenMe(!openMe)}
              >
                {userData?.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt="profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-3xl text-gray-600" />
                )}
              </div>

              {openMe && (
                <div className="absolute right-0 top-[44px] w-64 bg-white border border-gray-200 shadow-lg rounded-md p-3 z-50">
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

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {userData?.firstName || "User"}{" "}
                        {userData?.lastName || ""}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {userData?.email || "No email"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigate("/profile");
                      setOpenMe(false);
                    }}
                    className="w-full mt-3 border border-[#0a66c2] text-[#0a66c2] rounded-full py-1 text-sm font-semibold hover:bg-blue-50"
                  >
                    View Profile
                  </button>

                  <hr className="my-3" />

                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-700 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {!activeSearch && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50">
          <div className="flex items-center justify-around h-[56px]">
            {navItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center text-xs cursor-pointer ${
                  activeTab === item.label ? "text-black" : "text-gray-600"
                }`}
              >
                <span className="text-lg">
                  <NavIcon item={item} />
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;