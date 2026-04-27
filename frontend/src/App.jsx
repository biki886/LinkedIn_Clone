import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { userDataContext } from "./context/UserContext.jsx";
import EditProfile from "./components/EditProfile";
import Network from "./pages/Network";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

const App = () => {
  let { userData, loading } = useContext(userDataContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/signup"
        element={userData ? <Navigate to="/" /> : <Signup />}
      />
      <Route
        path="/login"
        element={userData ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/profile/edit"
        element={userData ? <EditProfile /> : <Navigate to="/login" />}
      />
      <Route
        path="/network"
        element={userData ? <Network /> : <Navigate to="/login" />}
      />
      <Route
        path="/profile"
        element={userData ? <Profile /> : <Navigate to="/login" />}
      />
      <Route
        path="/profile/:userId"
        element={userData ? <Profile /> : <Navigate to="/login" />}
      />
      <Route
        path="/notifications"
        element={userData ? <Notifications /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

export default App;
