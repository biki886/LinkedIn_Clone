import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { authDataContext } from "../context/AuthContext";
import { userDataContext } from "../context/userContext";

const Signup = () => {
  const [show, setShow] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { serverUrl } = useContext(authDataContext);
  const {userData, setUserData} = useContext(userDataContext)
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await axios.post(
        serverUrl + "/api/auth/signup",
        { firstName, lastName, email, password },
        { withCredentials: true }
      );

      console.log(result.data);
      setUserData(result.data)
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f3f2ef] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-[#0a66c2] text-center mb-4">
          Linked
          <span className="bg-[#0a66c2] text-white px-1 rounded-sm ml-1">
            in
          </span>
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-xl font-semibold text-center text-gray-900">
            Make the most of your professional life
          </h2>

          <form className="mt-4 space-y-3" onSubmit={handleSignUp}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Enter last name"
                className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email"
                className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <input
                type={show ? "text" : "password"}
                placeholder="Password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-[#0a66c2]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-black"
                onClick={() => setShow(!show)}
              >
                {show ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center font-medium">
                {error}
              </p>
            )}

            <p className="text-xs text-center text-gray-500">
              By clicking Agree & Join, you agree to the LinkedIn User
              Agreement, Privacy Policy, and Cookie Policy.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0a66c2] text-white py-2.5 rounded-full font-semibold hover:bg-[#004182] transition disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Agree & Join"}
            </button>
          </form>

          <p
            className="text-center text-gray-700 mt-4 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Already on LinkedIn?{" "}
            <span className="text-[#0a66c2] font-semibold hover:underline">
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;