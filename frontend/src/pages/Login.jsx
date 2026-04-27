import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { authDataContext } from "../context/AuthContext.jsx";
import { userDataContext } from "../context/UserContext.jsx";

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { serverUrl } = useContext(authDataContext);
  const {userData, setUserData} = useContext(userDataContext)
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await axios.post(
        serverUrl + "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      console.log(result.data);
      setUserData(result.data)
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col items-center px-4 py-8">
      <h1 className="text-4xl font-bold text-[#0a66c2] mb-6">
        Linked
        <span className="bg-[#0a66c2] text-white px-1 rounded-sm ml-1">
          in
        </span>
      </h1>

      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-center text-gray-900">
          Sign in
        </h2>

        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-3 border border-gray-400 rounded-md outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-[#0a66c2]"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0a66c2] text-white py-3 rounded-full font-semibold hover:bg-[#004182] transition disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Sign in"}
          </button>
        </form>

        <p
          className="text-center text-gray-700 mt-5 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          New to LinkedIn?{" "}
          <span className="text-[#0a66c2] font-semibold hover:underline">
            Join now
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
