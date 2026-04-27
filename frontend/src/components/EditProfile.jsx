import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { userDataContext } from "../context/UserContext.jsx";
import { authDataContext } from "../context/AuthContext.jsx";
import axios from "axios";
import {
  FaUserCircle,
  FaCamera,
  FaTimes,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

const EditProfile = () => {
  const { userData, setUserData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    headline: userData?.headline || "",
    location: userData?.location || "India",
    gender: userData?.gender || "",
    college: userData?.education?.[0]?.college || "",
    degree: userData?.education?.[0]?.degree || "",
    fieldOfStudy: userData?.education?.[0]?.fieldOfStudy || "",
    title: userData?.experience?.[0]?.title || "",
    company: userData?.experience?.[0]?.company || "",
    description: userData?.experience?.[0]?.description || "",
  });

  const [skills, setSkills] = useState(userData?.skills || []);
  const [skillInput, setSkillInput] = useState("");

  const [profileImage, setProfileImage] = useState(userData?.profileImage || "");
  const [coverImage, setCoverImage] = useState(userData?.coverImage || "");

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleCoverImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImage(URL.createObjectURL(file));
    }
  };

  const handleAddSkill = () => {
    const value = skillInput.trim();
    if (!value) return;

    const alreadyAdded = skills.some(
      (skill) => skill.toLowerCase() === value.toLowerCase()
    );

    if (alreadyAdded) {
      setSkillInput("");
      return;
    }

    setSkills([...skills, value]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skillName) => {
    setSkills(skills.filter((skill) => skill !== skillName));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("headline", form.headline);
      formData.append("location", form.location);
      formData.append("gender", form.gender);

      formData.append("skills", JSON.stringify(skills));

      formData.append(
        "education",
        JSON.stringify([
          {
            college: form.college,
            degree: form.degree,
            fieldOfStudy: form.fieldOfStudy,
          },
        ])
      );

      formData.append(
        "experience",
        JSON.stringify([
          {
            title: form.title,
            company: form.company,
            description: form.description,
          },
        ])
      );

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      if (coverImageFile) {
        formData.append("coverImage", coverImageFile);
      }

      const res = await axios.put(serverUrl + "/api/user/updateprofile", formData, {
        withCredentials: true,
      });

      setUserData(res.data.user);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f3f2ef] min-h-screen pt-[60px] pb-10">
      <Nav />

      <div className="max-w-[760px] mx-auto px-3">
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Edit profile
            </h2>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-gray-600 hover:bg-gray-100 p-2 rounded-full"
            >
              <FaTimes />
            </button>
          </div>

          <div className="relative h-44 bg-gray-200">
            {coverImage && (
              <img
                src={coverImage}
                alt="cover"
                className="w-full h-full object-cover"
              />
            )}

            <label className="absolute right-4 top-4 bg-white text-[#0a66c2] p-3 rounded-full cursor-pointer shadow hover:bg-blue-50">
              <FaCamera />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleCoverImage}
              />
            </label>
          </div>

          <div className="px-6 -mt-14">
            <div className="relative w-28 h-28">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-28 h-28 rounded-full border-4 border-white object-cover bg-white"
                />
              ) : (
                <FaUserCircle className="text-[112px] text-gray-500 bg-white rounded-full" />
              )}

              <label className="absolute bottom-1 right-1 bg-white text-[#0a66c2] p-2 rounded-full cursor-pointer shadow hover:bg-blue-50">
                <FaCamera />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleProfileImage}
                />
              </label>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5">
            <p className="text-xs text-gray-500">* Indicates required</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First name*"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />

              <Input
                label="Last name*"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <Textarea
              label="Headline"
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="Example: MERN Stack Developer | React.js | Node.js"
            />

            <Input
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Durgapur, West Bengal, India"
            />

            <div>
              <label className="text-sm text-gray-700">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-500 rounded px-3 py-2 outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="border-t pt-5">
              <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
              <p className="text-sm text-gray-500 mb-3">
                Add your skills one by one.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Example: React.js"
                  className="flex-1 border border-gray-400 rounded px-3 py-2 outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
                />

                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-full border border-[#0a66c2] text-[#0a66c2] font-semibold hover:bg-blue-50 flex items-center gap-2"
                >
                  <FaPlus />
                  Add
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-800">
                        {skill}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No skills added yet.</p>
                )}
              </div>
            </div>

            <div className="border-t pt-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Education
              </h3>

              <div className="space-y-4">
                <Input
                  label="College"
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                  placeholder="College name"
                />

                <Input
                  label="Degree"
                  name="degree"
                  value={form.degree}
                  onChange={handleChange}
                  placeholder="B.Tech / BCA / MCA"
                />

                <Input
                  label="Field of study"
                  name="fieldOfStudy"
                  value={form.fieldOfStudy}
                  onChange={handleChange}
                  placeholder="Computer Science"
                />
              </div>
            </div>

            <div className="border-t pt-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Experience
              </h3>

              <div className="space-y-4">
                <Input
                  label="Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Software Developer"
                />

                <Input
                  label="Company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company name"
                />

                <Textarea
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your work"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            <div className="border-t pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-5 py-2 rounded-full border font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-full bg-[#0a66c2] text-white font-semibold hover:bg-[#004182] disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm text-gray-700">{label}</label>
    <input
      {...props}
      className="mt-1 w-full border border-gray-500 rounded px-3 py-2 outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
    />
  </div>
);

const Textarea = ({ label, rows = 2, ...props }) => (
  <div>
    <label className="text-sm text-gray-700">{label}</label>
    <textarea
      rows={rows}
      {...props}
      className="mt-1 w-full border border-gray-500 rounded px-3 py-2 outline-none resize-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
    />
  </div>
);

export default EditProfile;
